#!/usr/bin/env python3
"""
OpenEvidence Backend API - 基于 Baichuan M2 Plus 模型
支持流式响应和引用标记的医学问答系统
"""

import json
import time
import asyncio
import logging
from datetime import datetime
import uuid
import os
from typing import Dict, Any

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from services.llm_service import BaichuanLLMService
from services.citation_service import CitationService
from services.streaming_service import StreamingService
from utils.text_processor import TextProcessor
from utils.citation_parser import CitationParser

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)

# 配置CORS - 允许前端访问
CORS(app, origins=[
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://154.93.109.243:3000',
    'http://localhost:3100',
    'http://127.0.0.1:3100',
    'http://154.93.109.243:3100',
    'https://*.skywork.website'
])

# 初始化服务
try:
    llm_service = BaichuanLLMService()
    citation_service = CitationService()
    streaming_service = StreamingService()
    text_processor = TextProcessor()
    citation_parser = CitationParser()
    
    logger.info("All services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    raise

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'model': 'Baichuan-M2-Plus',
        'services': {
            'llm': llm_service.is_available(),
            'citation': True,
            'streaming': True
        }
    })

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """
    处理医学问题的主要端点
    支持流式响应和实时引用标记
    """
    try:
        # 解析请求数据
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({'error': 'Question is required'}), 400
        
        question = data['question']
        user_id = data.get('userId', 'anonymous')
        session_id = data.get('sessionId', str(uuid.uuid4()))
        
        logger.info(f"Processing question: {question[:100]}... (User: {user_id})")
        
        # 生成流式响应
        def generate_streaming_response():
            try:
                # 1. 调用 Baichuan M2 Plus 模型获取流式响应
                logger.info("question")
                stream = llm_service.ask_question_stream(question)
                logger.info("here")
                # 2. 处理流式数据
                current_content = ""
                references = []
                thinking_complete = False
                
                for chunk in stream:
                    try:
                        # 检查是否是思考阶段
                        if hasattr(chunk.choices[0], 'thinking') and chunk.choices[0].thinking:
                            thinking_status = chunk.choices[0].thinking.get('status')
                            if thinking_status == 'completed':
                                thinking_complete = True
                                # 发送思考完成信号
                                thinking_data = {
                                    'type': 'thinking_complete',
                                    'isComplete': False,
                                    'timestamp': datetime.now().isoformat()
                                }
                                yield f"data: {json.dumps(thinking_data)}\n\n"
                            continue
                        
                        # 检查是否有引用信息
                        if hasattr(chunk.choices[0], 'grounding') and chunk.choices[0].grounding:
                            grounding = chunk.choices[0].grounding
                            if 'evidence' in grounding:
                                # 解析引用信息
                                references = citation_parser.parse_baichuan_references(
                                    grounding['evidence']
                                )
                                
                                # 发送引用信息
                                references_data = {
                                    'type': 'references_loaded',
                                    'references': references,
                                    'isComplete': False,
                                    'timestamp': datetime.now().isoformat()
                                }
                                yield f"data: {json.dumps(references_data)}\n\n"
                                continue
                        
                        # 处理文本内容
                        delta = chunk.choices[0].delta
                        if delta and delta.content:
                            content = delta.content
                            current_content += content
                            
                            # 检测引用标记并处理
                            processed_content, citations = citation_parser.extract_citations_from_text(
                                content, references
                            )
                            
                            if citations:
                                # 发送带引用的内容
                                content_data = {
                                    'content': processed_content,
                                    'citations': citations,
                                    'isComplete': False,
                                    'timestamp': datetime.now().isoformat()
                                }
                            else:
                                # 发送普通内容
                                content_data = {
                                    'content': content,
                                    'isComplete': False,
                                    'timestamp': datetime.now().isoformat()
                                }
                            #loger.info(content_data)
                            
                            yield f"data: {json.dumps(content_data)}\n\n"
                            
                            # 添加流式延迟
                            time.sleep(0.05)
                        
                        # 检查是否完成
                        if chunk.choices[0].finish_reason == 'stop':
                            # 生成后续问题
                            follow_up_questions = llm_service.generate_follow_up_questions(
                                question, current_content
                            )
                            
                            # 发送完成信号
                            completion_data = {
                                'isComplete': True,
                                'references': references,
                                'followUpQuestions': follow_up_questions,
                                'sessionId': session_id,
                                'timestamp': datetime.now().isoformat()
                            }
                            yield f"data: {json.dumps(completion_data)}\n\n"
                            break
                            
                    except Exception as chunk_error:
                        logger.error(f"Error processing chunk: {str(chunk_error)}")
                        continue
                
            except Exception as e:
                logger.error(f"Error in streaming response: {str(e)}")
                error_data = {
                    'error': f'Streaming error: {str(e)}',
                    'isComplete': True,
                    'timestamp': datetime.now().isoformat()
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        # 返回Server-Sent Events响应
        return Response(
            generate_streaming_response(),
            mimetype='text/plain',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/references/<int:ref_id>', methods=['GET'])
def get_reference_details(ref_id):
    """获取特定引用的详细信息"""
    try:
        reference = citation_service.get_reference_by_id(ref_id)
        if not reference:
            return jsonify({'error': 'Reference not found'}), 404
        
        return jsonify(reference)
    except Exception as e:
        logger.error(f"Error getting reference {ref_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/search/history', methods=['GET'])
def get_search_history():
    """获取用户搜索历史"""
    try:
        user_id = request.args.get('userId', 'anonymous')
        # 这里可以从数据库获取用户搜索历史
        history = [
            {
                'id': 1,
                'question': '25岁健康女性种植牙，刚做完植入种植体，请问手术后是否需要服用抗生素',
                'timestamp': '2024-01-15T10:30:00Z'
            },
            {
                'id': 2,
                'question': '高血压患者的最新管理指南是什么？',
                'timestamp': '2024-01-14T15:45:00Z'
            }
        ]
        return jsonify({'history': history})
    except Exception as e:
        logger.error(f"Error getting search history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/preferences', methods=['GET', 'POST'])
def user_preferences():
    """用户偏好设置"""
    try:
        if request.method == 'GET':
            user_id = request.args.get('userId', 'anonymous')
            preferences = {
                'language': 'zh',
                'citation_style': 'numbered',
                'response_speed': 'normal',
                'model': 'Baichuan-M2-Plus'
            }
            return jsonify(preferences)
        
        elif request.method == 'POST':
            data = request.get_json()
            user_id = data.get('userId', 'anonymous')
            preferences = data.get('preferences', {})
            
            logger.info(f"Saving preferences for user {user_id}: {preferences}")
            return jsonify({'success': True, 'message': 'Preferences saved'})
            
    except Exception as e:
        logger.error(f"Error handling preferences: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/model/status', methods=['GET'])
def model_status():
    """获取模型状态"""
    try:
        status = {
            'model_name': 'Baichuan-M2-Plus',
            'available': llm_service.is_available(),
            'api_base': llm_service.get_api_base(),
            'last_check': datetime.now().isoformat()
        }
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting OpenEvidence Backend API with Baichuan M2 Plus...")
    logger.info("Available endpoints:")
    logger.info("  POST /api/ask - Ask medical questions")
    logger.info("  GET  /api/references/<id> - Get reference details")
    logger.info("  GET  /api/search/history - Get search history")
    logger.info("  GET  /api/model/status - Get model status")
    logger.info("  GET  /health - Health check")
    
    # 获取配置
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8001))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    
    # 启动服务器
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )
