"""
基于 Baichuan M2 Plus 的 LLM 服务
"""

import logging
from typing import List, Dict, Any, Iterator, Optional
import json
import re

from models.baichuan_client import BaichuanClient

logger = logging.getLogger(__name__)

class BaichuanLLMService:
    """基于 Baichuan M2 Plus 的 LLM 服务"""
    
    def __init__(self):
        """初始化 LLM 服务"""
        try:
            self.client = BaichuanClient()
            self.system_prompt = self._get_system_prompt()
            logger.info("Baichuan LLM Service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Baichuan LLM Service: {str(e)}")
            raise
    
    def _get_system_prompt(self) -> str:
        """获取系统提示词"""
        return """你是一个专业的医学问答助手，基于循证医学原则回答问题。

请遵循以下要求：
1. 基于最新的医学文献和临床指南提供准确的医学信息
2. 在回答中使用上标引用格式，如 ^[1]^、^[2]^ 等
3. 提供具体的研究数据和统计信息
4. 明确区分不同证据等级（如RCT、系统评价、专家共识等）
5. 对于有争议的话题，要平衡展示不同观点
6. 强调个体化治疗的重要性
7. 使用专业但易懂的医学术语
8. 在适当时候提醒咨询专业医生

回答格式要求：
- 开头直接给出明确的结论
- 按段落组织内容，每段聚焦一个要点
- 使用引用标记标注信息来源
- 结尾可以提供相关的后续问题建议"""
    
    def ask_question_stream(self, question: str) -> Iterator[Any]:
        """
        流式问答
        
        Args:
            question: 用户问题
            
        Yields:
            流式响应块
        """
        try:
            messages = [
                {"role": "assistant", "content": self.system_prompt},
                {"role": "user", "content": question}
            ]
            
            logger.info(f"Sending question to Baichuan: {question[:100]}...")
            
            # 调用 Baichuan M2 Plus 流式 API
            stream = self.client.chat_completion_stream(
                messages=messages,
                temperature=0.1,  # 降低随机性，提高准确性
                max_tokens=2000,
                top_p=0.9
            )
            
            for chunk in stream:
                yield chunk
                
        except Exception as e:
            logger.error(f"Error in streaming question: {str(e)}")
            raise
    
    def ask_question(self, question: str) -> Dict[str, Any]:
        """
        非流式问答
        
        Args:
            question: 用户问题
            
        Returns:
            Dict: 完整响应
        """
        try:
            messages = [
                {"role": "assistant", "content": self.system_prompt},
                {"role": "user", "content": question}
            ]
            
            response = self.client.chat_completion(
                messages=messages,
                stream=False,
                temperature=0.1,
                max_tokens=2000,
                top_p=0.9
            )
            
            # 解析响应
            content = response.choices[0].message.content
            references = []
            
            # 提取引用信息
            if hasattr(response.choices[0].message, 'grounding') and response.choices[0].message.grounding:
                references = self._parse_grounding_info(response.choices[0].message.grounding)
            
            return {
                'content': content,
                'references': references,
                'model': 'Baichuan-M2-Plus',
                'usage': response.usage._asdict() if response.usage else None
            }
            
        except Exception as e:
            logger.error(f"Error in question answering: {str(e)}")
            raise
    
    def generate_follow_up_questions(self, original_question: str, answer_content: str) -> List[str]:
        """
        生成后续问题
        
        Args:
            original_question: 原始问题
            answer_content: 回答内容
            
        Returns:
            List[str]: 后续问题列表
        """
        try:
            # 基于问题内容生成相关的后续问题
            follow_up_prompt = f"""
基于以下医学问答对话，生成3个相关的后续问题：

原始问题：{original_question}
回答内容：{answer_content[:500]}...

请生成3个具体、实用的后续问题，格式为简洁的问句。每个问题一行，不需要编号。
"""
            
            messages = [
                {"role": "user", "content": follow_up_prompt}
            ]
            
            response = self.client.chat_completion(
                messages=messages,
                stream=False,
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content.strip()
            
            # 解析后续问题
            questions = [q.strip() for q in content.split('\n') if q.strip()]
            
            # 确保返回3个问题
            if len(questions) < 3:
                # 添加通用后续问题
                generic_questions = [
                    "这种治疗方法有哪些潜在的副作用？",
                    "对于特殊人群（如孕妇、老年人）有什么特别的注意事项？",
                    "最新的研究进展如何？"
                ]
                questions.extend(generic_questions[:3-len(questions)])
            
            return questions[:3]
            
        except Exception as e:
            logger.error(f"Error generating follow-up questions: {str(e)}")
            # 返回默认后续问题
            return [
                "这个治疗方案的最新研究进展如何？",
                "对于不同年龄段的患者有什么特殊考虑？",
                "有哪些替代治疗方案可以选择？"
            ]
    
    def _parse_grounding_info(self, grounding: Dict) -> List[Dict]:
        """
        解析 grounding 信息
        
        Args:
            grounding: grounding 数据
            
        Returns:
            List[Dict]: 解析后的引用信息
        """
        try:
            references = []
            
            if 'evidence' in grounding:
                for evidence in grounding['evidence']:
                    ref = {
                        'id': evidence.get('ref_num', 0),
                        'title': evidence.get('title', ''),
                        'title_zh': evidence.get('title_zh', ''),
                        'url': evidence.get('url', ''),
                        'authors': evidence.get('author', ''),
                        'journal': self._extract_journal_from_publication_info(
                            evidence.get('publication_info', '')
                        ),
                        'publishedDate': self._extract_date_from_publication_info(
                            evidence.get('publication_info', '')
                        ),
                        'type': self._map_evidence_class(evidence.get('evidence_class', '')),
                        'isLeading': self._is_leading_journal(
                            evidence.get('publication_info', '')
                        ),
                        'isNew': self._is_recent_publication(
                            evidence.get('publication_info', '')
                        ),
                        'relevanceScore': 0.9  # 默认高相关性
                    }
                    references.append(ref)
            
            return references
            
        except Exception as e:
            logger.error(f"Error parsing grounding info: {str(e)}")
            return []
    
    def _extract_journal_from_publication_info(self, pub_info: str) -> str:
        """从发表信息中提取期刊名"""
        try:
            # 匹配期刊名模式
            patterns = [
                r'^([^.]+)\.',  # 期刊名通常在第一个点之前
                r'([A-Za-z\s]+)\s+\d{4}',  # 期刊名 + 年份
            ]
            
            for pattern in patterns:
                match = re.search(pattern, pub_info)
                if match:
                    return match.group(1).strip()
            
            return pub_info.split('.')[0] if '.' in pub_info else pub_info
            
        except Exception:
            return 'Unknown Journal'
    
    def _extract_date_from_publication_info(self, pub_info: str) -> str:
        """从发表信息中提取日期"""
        try:
            # 匹配日期模式
            date_patterns = [
                r'(\d{4})\s+[A-Za-z]+\s+(\d{1,2})',  # 2024 Jan 15
                r'(\d{4})-(\d{1,2})-(\d{1,2})',      # 2024-01-15
                r'(\d{4})',                          # 2024
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, pub_info)
                if match:
                    if len(match.groups()) >= 3:
                        return f"{match.group(1)}-{match.group(2).zfill(2)}-{match.group(3).zfill(2)}"
                    elif len(match.groups()) == 2:
                        return f"{match.group(1)}-{match.group(2).zfill(2)}-01"
                    else:
                        return f"{match.group(1)}-01-01"
            
            return "2024-01-01"  # 默认日期
            
        except Exception:
            return "2024-01-01"
    
    def _map_evidence_class(self, evidence_class: str) -> str:
        """映射证据类型"""
        mapping = {
            'RCT': 'research',
            'Systematic Review': 'meta-analysis',
            'Meta-Analysis': 'meta-analysis',
            'Literature Review': 'review',
            'Guideline': 'guideline',
            'Case Study': 'research'
        }
        return mapping.get(evidence_class, 'research')
    
    def _is_leading_journal(self, pub_info: str) -> bool:
        """判断是否为顶级期刊"""
        leading_journals = [
            'Nature', 'Science', 'Cell', 'Lancet', 'NEJM', 'JAMA',
            'BMJ', 'Cochrane', 'PLoS Med', 'Ann Intern Med'
        ]
        
        return any(journal.lower() in pub_info.lower() for journal in leading_journals)
    
    def _is_recent_publication(self, pub_info: str) -> bool:
        """判断是否为近期发表"""
        try:
            # 查找年份
            year_match = re.search(r'(\d{4})', pub_info)
            if year_match:
                year = int(year_match.group(1))
                return year >= 2022  # 2022年及以后为新研究
            return False
        except Exception:
            return False
    
    def is_available(self) -> bool:
        """检查服务是否可用"""
        try:
            return self.client.is_available()
        except Exception:
            return False
    
    def get_api_base(self) -> str:
        """获取 API 基础URL"""
        return self.client.base_url
