"""
流式响应服务
处理 Baichuan M2 Plus 模型的流式输出
"""

import json
import time
import logging
from typing import Iterator, Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class StreamingService:
    """流式响应服务"""
    
    def __init__(self, word_delay: float = 0.05, segment_delay: float = 0.2):
        """
        初始化流式服务
        
        Args:
            word_delay: 词间延迟（秒）
            segment_delay: 段落间延迟（秒）
        """
        self.word_delay = word_delay
        self.segment_delay = segment_delay
        logger.info("Streaming service initialized")
    
    def process_baichuan_stream(self, stream: Iterator[Any], question: str) -> Iterator[str]:
        """
        处理 Baichuan 流式响应
        
        Args:
            stream: Baichuan 流式响应
            question: 原始问题
            
        Yields:
            str: SSE 格式的数据
        """
        try:
            current_content = ""
            references = []
            thinking_complete = False
            content_started = False
            
            for chunk in stream:
                try:
                    choice = chunk.choices[0]
                    
                    # 1. 处理思考阶段
                    if hasattr(choice, 'thinking') and choice.thinking:
                        thinking_status = choice.thinking.get('status')
                        
                        if thinking_status == 'in_progress':
                            # 发送思考进度
                            steps = choice.thinking.get('steps', [])
                            if steps:
                                latest_step = steps[-1]
                                thinking_data = {
                                    'type': 'thinking_progress',
                                    'step': latest_step.get('label', ''),
                                    'status': latest_step.get('status', ''),
                                    'isComplete': False,
                                    'timestamp': datetime.now().isoformat()
                                }
                                yield self._create_sse_response(thinking_data)
                        
                        elif thinking_status == 'completed' and not thinking_complete:
                            thinking_complete = True
                            thinking_data = {
                                'type': 'thinking_complete',
                                'isComplete': False,
                                'timestamp': datetime.now().isoformat()
                            }
                            yield self._create_sse_response(thinking_data)
                        
                        continue
                    
                    # 2. 处理引用信息
                    if hasattr(choice, 'grounding') and choice.grounding and not references:
                        grounding = choice.grounding
                        if 'evidence' in grounding:
                            from utils.citation_parser import CitationParser
                            parser = CitationParser()
                            references = parser.parse_baichuan_references(grounding['evidence'])
                            
                            # 发送引用信息
                            references_data = {
                                'type': 'references_loaded',
                                'references': references,
                                'count': len(references),
                                'isComplete': False,
                                'timestamp': datetime.now().isoformat()
                            }
                            yield self._create_sse_response(references_data)
                        
                        continue
                    
                    # 3. 处理文本内容
                    if hasattr(choice, 'delta') and choice.delta and choice.delta.content:
                        content = choice.delta.content
                        current_content += content
                        
                        if not content_started:
                            content_started = True
                            # 发送内容开始信号
                            start_data = {
                                'type': 'content_start',
                                'isComplete': False,
                                'timestamp': datetime.now().isoformat()
                            }
                            yield self._create_sse_response(start_data)
                        
                        # 检测并处理引用标记
                        processed_content, citations = self._process_content_with_citations(
                            content, references
                        )
                        
                        # 发送内容块
                        content_data = {
                            'content': processed_content,
                            'citations': citations if citations else None,
                            'isComplete': False,
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        # 如果有引用，标记为引用内容
                        if citations:
                            content_data['type'] = 'cited_content'
                        
                        yield self._create_sse_response(content_data)
                        
                        # 添加流式延迟
                        time.sleep(self.word_delay)
                    
                    # 4. 检查完成状态
                    if choice.finish_reason == 'stop':
                        # 生成后续问题
                        follow_up_questions = self._generate_follow_up_questions(
                            question, current_content
                        )
                        
                        # 发送完成信号
                        completion_data = {
                            'isComplete': True,
                            'references': references,
                            'followUpQuestions': follow_up_questions,
                            'totalContent': current_content,
                            'timestamp': datetime.now().isoformat()
                        }
                        yield self._create_sse_response(completion_data)
                        break
                
                except Exception as chunk_error:
                    logger.error(f"Error processing chunk: {str(chunk_error)}")
                    continue
            
        except Exception as e:
            logger.error(f"Error in Baichuan stream processing: {str(e)}")
            error_data = {
                'error': f'Stream processing error: {str(e)}',
                'isComplete': True,
                'timestamp': datetime.now().isoformat()
            }
            yield self._create_sse_response(error_data)
    
    def _process_content_with_citations(self, content: str, references: List[Dict]) -> tuple:
        """
        处理内容中的引用标记
        
        Args:
            content: 内容文本
            references: 引用列表
            
        Returns:
            tuple: (处理后的内容, 引用编号列表)
        """
        try:
            from utils.citation_parser import CitationParser
            parser = CitationParser()
            
            # 提取引用信息
            processed_content, citations = parser.extract_citations_from_text(content, references)
            
            return processed_content, citations
            
        except Exception as e:
            logger.error(f"Error processing content with citations: {str(e)}")
            return content, []
    
    def _generate_follow_up_questions(self, question: str, content: str) -> List[str]:
        """
        生成后续问题
        
        Args:
            question: 原始问题
            content: 回答内容
            
        Returns:
            List[str]: 后续问题列表
        """
        try:
            # 基于内容关键词生成相关问题
            if "种植牙" in question or "种植体" in question:
                return [
                    "种植牙手术后的护理要点有哪些？",
                    "种植牙的成功率和影响因素是什么？",
                    "种植牙术后可能出现哪些并发症？"
                ]
            elif "抗生素" in question:
                return [
                    "抗生素耐药性的预防措施有哪些？",
                    "如何选择合适的抗生素类型？",
                    "抗生素使用的最佳时机是什么时候？"
                ]
            elif "高血压" in question:
                return [
                    "高血压患者的生活方式干预建议？",
                    "高血压药物治疗的个体化原则？",
                    "高血压并发症的预防策略？"
                ]
            else:
                return [
                    "这种治疗方法的最新研究进展如何？",
                    "对于特殊人群有什么注意事项？",
                    "有哪些替代治疗方案可以选择？"
                ]
                
        except Exception as e:
            logger.error(f"Error generating follow-up questions: {str(e)}")
            return [
                "相关的最新研究进展如何？",
                "对于不同患者群体有什么特殊考虑？",
                "还有哪些需要了解的相关信息？"
            ]
    
    def _create_sse_response(self, data: Dict[str, Any]) -> str:
        """
        创建 SSE 格式响应
        
        Args:
            data: 响应数据
            
        Returns:
            str: SSE 格式字符串
        """
        try:
            return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error(f"Error creating SSE response: {str(e)}")
            return f"data: {json.dumps({'error': 'SSE format error'})}\n\n"
    
    def create_error_response(self, error_message: str) -> str:
        """
        创建错误响应
        
        Args:
            error_message: 错误信息
            
        Returns:
            str: 错误 SSE 响应
        """
        error_data = {
            'error': error_message,
            'isComplete': True,
            'timestamp': datetime.now().isoformat()
        }
        return self._create_sse_response(error_data)
    
    def create_heartbeat(self) -> str:
        """
        创建心跳信号
        
        Returns:
            str: 心跳 SSE 响应
        """
        heartbeat_data = {
            'type': 'heartbeat',
            'timestamp': datetime.now().isoformat()
        }
        return self._create_sse_response(heartbeat_data)