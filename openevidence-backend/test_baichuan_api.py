#!/usr/bin/env python3
"""
OpenEvidence Backend API 测试脚本 - Baichuan M2 Plus
"""

import requests
import json
import time
import sys
import os
from datetime import datetime

def test_health_check():
    """测试健康检查端点"""
    print("🔍 测试健康检查...")
    try:
        response = requests.get('http://localhost:8001/health')
        if response.status_code == 200:
            data = response.json()
            print("✅ 健康检查通过")
            print(f"   版本: {data.get('version')}")
            print(f"   模型: {data.get('model')}")
            print(f"   服务状态: {data.get('services')}")
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查错误: {str(e)}")
        return False

def test_model_status():
    """测试模型状态端点"""
    print("\n🔍 测试模型状态...")
    try:
        response = requests.get('http://localhost:8001/api/model/status')
        if response.status_code == 200:
            data = response.json()
            print("✅ 模型状态检查通过")
            print(f"   模型名称: {data.get('model_name')}")
            print(f"   可用性: {data.get('available')}")
            print(f"   API地址: {data.get('api_base')}")
            return data.get('available', False)
        else:
            print(f"❌ 模型状态检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 模型状态检查错误: {str(e)}")
        return False

def test_streaming_api():
    """测试流式 API"""
    print("\n🔍 测试 Baichuan M2 Plus 流式问答 API...")
    
    test_questions = [
        "25岁健康女性种植牙，刚做完植入种植体，请问手术后是否需要服用抗生素？",
        "高血压患者的最新管理指南是什么？",
        "糖尿病患者使用二甲双胍的注意事项有哪些？"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n📝 测试问题 {i}: {question[:30]}...")
        
        try:
            payload = {
                "question": question,
                "userId": "test_user",
                "sessionId": f"test_session_{i}_{int(time.time())}"
            }
            
            response = requests.post(
                'http://localhost:8001/api/ask',
                json=payload,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                print("✅ API 响应成功，开始接收流式数据...")
                
                # 解析流式响应
                content_chunks = []
                citations_found = []
                references = []
                follow_up_questions = []
                thinking_steps = []
                
                chunk_count = 0
                start_time = time.time()
                
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            try:
                                data = json.loads(line_str[6:])
                                chunk_count += 1
                                
                                # 处理不同类型的数据
                                if data.get('type') == 'thinking_progress':
                                    step = data.get('step', '')
                                    status = data.get('status', '')
                                    thinking_steps.append(f"{step} ({status})")
                                    print(f"   🧠 思考: {step}")
                                
                                elif data.get('type') == 'thinking_complete':
                                    print(f"   ✅ 思考完成")
                                
                                elif data.get('type') == 'references_loaded':
                                    references = data.get('references', [])
                                    print(f"   📚 加载引用: {len(references)} 条")
                                
                                elif data.get('type') == 'content_start':
                                    print(f"   📄 开始输出内容...")
                                
                                elif 'content' in data:
                                    content = data['content']
                                    content_chunks.append(content)
                                    citations = data.get('citations', [])
                                    if citations:
                                        citations_found.extend(citations)
                                        print(f"   🔗 发现引用: {citations}")
                                    
                                    # 显示内容片段（限制长度）
                                    if len(content.strip()) > 0:
                                        display_content = content.strip()[:50]
                                        if len(content.strip()) > 50:
                                            display_content += "..."
                                        print(f"   📝 内容: {display_content}")
                                
                                elif data.get('isComplete'):
                                    references = data.get('references', [])
                                    follow_up_questions = data.get('followUpQuestions', [])
                                    print(f"   ✅ 响应完成")
                                    print(f"   📊 总引用数: {len(references)}")
                                    print(f"   ❓ 后续问题数: {len(follow_up_questions)}")
                                    break
                                
                                elif 'error' in data:
                                    print(f"   ❌ 错误: {data['error']}")
                                    break
                                    
                            except json.JSONDecodeError as e:
                                print(f"   ⚠️  JSON 解析错误: {e}")
                                continue
                
                # 输出统计信息
                end_time = time.time()
                duration = end_time - start_time
                full_content = ''.join(content_chunks)
                
                print(f"\n   📊 响应统计:")
                print(f"      总耗时: {duration:.2f} 秒")
                print(f"      数据块数: {chunk_count}")
                print(f"      内容长度: {len(full_content)} 字符")
                print(f"      引用标记: {len(set(citations_found))} 个")
                print(f"      思考步骤: {len(thinking_steps)} 步")
                
                # 显示部分内容
                if full_content:
                    preview = full_content[:200]
                    if len(full_content) > 200:
                        preview += "..."
                    print(f"      内容预览: {preview}")
                
                # 显示引用信息
                if references:
                    print(f"\n   📚 引用详情:")
                    for ref in references[:3]:  # 只显示前3个
                        print(f"      [{ref.get('id')}] {ref.get('title', '')[:60]}...")
                
                # 显示后续问题
                if follow_up_questions:
                    print(f"\n   ❓ 后续问题:")
                    for fq in follow_up_questions:
                        print(f"      • {fq}")
                
            else:
                print(f"❌ API 响应失败: {response.status_code}")
                print(f"   错误: {response.text}")
                
        except Exception as e:
            print(f"❌ 测试错误: {str(e)}")
        
        # 测试间隔
        if i < len(test_questions):
            print(f"\n⏳ 等待 3 秒后进行下一个测试...")
            time.sleep(3)

def test_reference_api():
    """测试引用详情 API"""
    print("\n🔍 测试引用详情 API...")
    
    reference_ids = [1, 2, 3, 999]  # 包含一个不存在的ID
    
    for ref_id in reference_ids:
        try:
            response = requests.get(f'http://localhost:8001/api/references/{ref_id}')
            
            if response.status_code == 200:
                ref_data = response.json()
                title = ref_data.get('title', 'Unknown')[:50]
                print(f"✅ 引用 {ref_id}: {title}...")
            elif response.status_code == 404:
                print(f"⚠️  引用 {ref_id}: 未找到")
            else:
                print(f"❌ 引用 {ref_id}: 错误 {response.status_code}")
                
        except Exception as e:
            print(f"❌ 引用 {ref_id} 测试错误: {str(e)}")

def test_preferences_api():
    """测试用户偏好 API"""
    print("\n🔍 测试用户偏好 API...")
    
    try:
        # 测试获取偏好
        response = requests.get('http://localhost:8001/api/preferences?userId=test_user')
        
        if response.status_code == 200:
            preferences = response.json()
            print(f"✅ 获取偏好成功")
            print(f"   语言: {preferences.get('language')}")
            print(f"   模型: {preferences.get('model')}")
        else:
            print(f"❌ 获取偏好失败: {response.status_code}")
        
        # 测试设置偏好
        new_preferences = {
            'userId': 'test_user',
            'preferences': {
                'language': 'zh',
                'citation_style': 'numbered',
                'response_speed': 'fast',
                'model': 'Baichuan-M2-Plus'
            }
        }
        
        response = requests.post(
            'http://localhost:8001/api/preferences',
            json=new_preferences
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 设置偏好成功: {result.get('message')}")
        else:
            print(f"❌ 设置偏好失败: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 偏好测试错误: {str(e)}")

def main():
    """主测试函数"""
    print("🧪 OpenEvidence Backend API 测试 - Baichuan M2 Plus")
    print("=" * 60)
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # 检查环境变量
    api_key = os.getenv('BAICHUAN_API_KEY')
    if not api_key:
        print("⚠️  警告: 未设置 BAICHUAN_API_KEY 环境变量")
        print("   某些测试可能会失败")
    else:
        print(f"✅ Baichuan API Key: {api_key[:10]}...")
    
    # 检查服务器是否运行
    if not test_health_check():
        print("\n❌ 服务器未运行，请先启动后端服务")
        print("   运行命令: python app.py")
        sys.exit(1)
    
    # 检查模型状态
    model_available = test_model_status()
    if not model_available:
        print("\n⚠️  警告: Baichuan 模型不可用")
        print("   请检查 API Key 和网络连接")
    
    # 运行所有测试
    test_streaming_api()
    test_reference_api()
    test_preferences_api()
    
    print("\n" + "=" * 60)
    print("🎉 测试完成！")
    print("\n💡 提示:")
    print("   - 如果流式响应测试失败，请检查 Baichuan API Key")
    print("   - 如果响应速度慢，可以调整 STREAMING_WORD_DELAY 参数")
    print("   - 查看服务器日志获取更多调试信息")

if __name__ == '__main__':
    main()
