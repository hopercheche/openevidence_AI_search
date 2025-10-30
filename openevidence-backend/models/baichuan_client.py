"""
Baichuan M2 Plus 模型客户端
"""

import os
import logging
from typing import Optional, Iterator, Dict, Any
from openai import OpenAI

logger = logging.getLogger(__name__)

class BaichuanClient:
    """Baichuan M2 Plus 模型客户端"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        初始化 Baichuan 客户端
        
        Args:
            api_key: API 密钥
            base_url: API 基础URL
        """
        self.api_key = api_key or os.getenv('BAICHUAN_API_KEY')
        self.base_url = base_url or os.getenv('BAICHUAN_BASE_URL', 'https://api.baichuan-ai.com/v1/')
        self.model_name = 'Baichuan-M2-Plus'
        
        if not self.api_key:
            raise ValueError("Baichuan API key is required. Set BAICHUAN_API_KEY environment variable.")
        
        # 初始化 OpenAI 客户端（兼容 Baichuan API）
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
        
        logger.info(f"Baichuan client initialized with base URL: {self.base_url}")
    
    def chat_completion(self, messages: list, stream: bool = False, **kwargs) -> Any:
        """
        创建聊天完成
        
        Args:
            messages: 消息列表
            stream: 是否使用流式响应
            **kwargs: 其他参数
            
        Returns:
            聊天完成响应
        """
        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                stream=stream,
                **kwargs
            )
            
            return completion
            
        except Exception as e:
            logger.error(f"Error in chat completion: {str(e)}")
            raise
    
    def chat_completion_stream(self, messages: list, **kwargs) -> Iterator[Any]:
        """
        创建流式聊天完成
        
        Args:
            messages: 消息列表
            **kwargs: 其他参数
            
        Yields:
            流式响应块
        """
        try:
            stream = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                stream=True,
                **kwargs
            )
            
            for chunk in stream:
                yield chunk
                
        except Exception as e:
            logger.error(f"Error in streaming chat completion: {str(e)}")
            raise
    
    def is_available(self) -> bool:
        """
        检查服务是否可用
        
        Returns:
            bool: 服务是否可用
        """
        try:
            # 发送一个简单的测试请求
            test_messages = [
                {"role": "user", "content": "测试连接"}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=test_messages,
                max_tokens=10,
                stream=False
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Baichuan service unavailable: {str(e)}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        获取模型信息
        
        Returns:
            Dict: 模型信息
        """
        return {
            'model_name': self.model_name,
            'api_base': self.base_url,
            'features': [
                'medical_qa',
                'citation_support',
                'streaming_response',
                'chinese_language',
                'evidence_grounding'
            ]
        }