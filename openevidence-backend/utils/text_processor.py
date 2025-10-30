"""
文本处理工具
处理医学文本的分析和格式化
"""

import re
import logging
from typing import List, Dict, Tuple, Any

logger = logging.getLogger(__name__)

class TextProcessor:
    """文本处理器"""
    
    def __init__(self):
        """初始化文本处理器"""
        # 医学术语词典
        self.medical_terms = {
            '种植牙': ['dental implant', 'implant dentistry'],
            '种植体': ['implant fixture', 'dental implant'],
            '抗生素': ['antibiotic', 'antimicrobial'],
            '预防性': ['prophylactic', 'preventive'],
            '随机对照试验': ['RCT', 'randomized controlled trial'],
            '系统评价': ['systematic review'],
            '荟萃分析': ['meta-analysis'],
            '循证医学': ['evidence-based medicine', 'EBM']
        }
        
        # 句子分割符
        self.sentence_delimiters = ['。', '！', '？', '.', '!', '?']
        
        logger.info("Text processor initialized")
    
    def segment_by_sentences(self, text: str) -> List[str]:
        """
        按句子分割文本
        
        Args:
            text: 输入文本
            
        Returns:
            List[str]: 句子列表
        """
        try:
            sentences = []
            current_sentence = ""
            
            for char in text:
                current_sentence += char
                
                if char in self.sentence_delimiters:
                    # 检查是否是真正的句子结尾
                    if self._is_sentence_end(current_sentence):
                        sentences.append(current_sentence.strip())
                        current_sentence = ""
            
            # 添加剩余文本
            if current_sentence.strip():
                sentences.append(current_sentence.strip())
            
            return [s for s in sentences if s]
            
        except Exception as e:
            logger.error(f"Error segmenting sentences: {str(e)}")
            return [text]
    
    def segment_by_paragraphs(self, text: str) -> List[str]:
        """
        按段落分割文本
        
        Args:
            text: 输入文本
            
        Returns:
            List[str]: 段落列表
        """
        try:
            # 按双换行符分割段落
            paragraphs = re.split(r'\n\s*\n', text)
            
            # 清理空段落
            paragraphs = [p.strip() for p in paragraphs if p.strip()]
            
            return paragraphs
            
        except Exception as e:
            logger.error(f"Error segmenting paragraphs: {str(e)}")
            return [text]
    
    def extract_medical_terms(self, text: str) -> List[Dict[str, Any]]:
        """
        提取医学术语
        
        Args:
            text: 输入文本
            
        Returns:
            List[Dict]: 医学术语信息
        """
        try:
            found_terms = []
            
            for chinese_term, english_terms in self.medical_terms.items():
                if chinese_term in text:
                    positions = []
                    start = 0
                    while True:
                        pos = text.find(chinese_term, start)
                        if pos == -1:
                            break
                        positions.append(pos)
                        start = pos + 1
                    
                    if positions:
                        found_terms.append({
                            'term': chinese_term,
                            'english': english_terms,
                            'positions': positions,
                            'count': len(positions)
                        })
            
            return found_terms
            
        except Exception as e:
            logger.error(f"Error extracting medical terms: {str(e)}")
            return []
    
    def analyze_text_structure(self, text: str) -> Dict[str, Any]:
        """
        分析文本结构
        
        Args:
            text: 输入文本
            
        Returns:
            Dict: 文本结构分析结果
        """
        try:
            sentences = self.segment_by_sentences(text)
            paragraphs = self.segment_by_paragraphs(text)
            medical_terms = self.extract_medical_terms(text)
            
            # 统计信息
            stats = {
                'total_chars': len(text),
                'total_sentences': len(sentences),
                'total_paragraphs': len(paragraphs),
                'avg_sentence_length': sum(len(s) for s in sentences) / len(sentences) if sentences else 0,
                'medical_terms_count': len(medical_terms),
                'has_citations': self._has_citations(text)
            }
            
            return {
                'sentences': sentences,
                'paragraphs': paragraphs,
                'medical_terms': medical_terms,
                'statistics': stats
            }
            
        except Exception as e:
            logger.error(f"Error analyzing text structure: {str(e)}")
            return {
                'sentences': [text],
                'paragraphs': [text],
                'medical_terms': [],
                'statistics': {'total_chars': len(text)}
            }
    
    def clean_text(self, text: str) -> str:
        """
        清理文本
        
        Args:
            text: 输入文本
            
        Returns:
            str: 清理后的文本
        """
        try:
            # 移除多余的空白字符
            text = re.sub(r'\s+', ' ', text)
            
            # 移除首尾空白
            text = text.strip()
            
            # 标准化标点符号
            text = text.replace('，', '，')
            text = text.replace('。', '。')
            text = text.replace('？', '？')
            text = text.replace('！', '！')
            
            return text
            
        except Exception as e:
            logger.error(f"Error cleaning text: {str(e)}")
            return text
    
    def format_medical_response(self, content: str, references: List[Dict]) -> str:
        """
        格式化医学回答
        
        Args:
            content: 回答内容
            references: 引用列表
            
        Returns:
            str: 格式化后的回答
        """
        try:
            # 清理文本
            formatted_content = self.clean_text(content)
            
            # 确保段落格式正确
            paragraphs = self.segment_by_paragraphs(formatted_content)
            formatted_content = '\n\n'.join(paragraphs)
            
            return formatted_content
            
        except Exception as e:
            logger.error(f"Error formatting medical response: {str(e)}")
            return content
    
    def extract_key_points(self, text: str) -> List[str]:
        """
        提取关键要点
        
        Args:
            text: 输入文本
            
        Returns:
            List[str]: 关键要点列表
        """
        try:
            key_points = []
            
            # 查找强调性表述
            emphasis_patterns = [
                r'[**](.*?)[**]',  # **强调**
                r'重要的是(.*?)。',
                r'需要注意的是(.*?)。',
                r'关键在于(.*?)。',
                r'建议(.*?)。'
            ]
            
            for pattern in emphasis_patterns:
                matches = re.findall(pattern, text)
                key_points.extend(matches)
            
            # 查找列表项
            list_items = re.findall(r'[•\-\*]\s*(.*?)(?=\n|$)', text)
            key_points.extend(list_items)
            
            # 清理和去重
            key_points = [point.strip() for point in key_points if point.strip()]
            key_points = list(dict.fromkeys(key_points))  # 去重保持顺序
            
            return key_points[:5]  # 返回前5个要点
            
        except Exception as e:
            logger.error(f"Error extracting key points: {str(e)}")
            return []
    
    def _is_sentence_end(self, sentence: str) -> bool:
        """
        判断是否为真正的句子结尾
        
        Args:
            sentence: 句子文本
            
        Returns:
            bool: 是否为句子结尾
        """
        try:
            # 排除缩写等情况
            sentence = sentence.strip()
            
            # 太短的不算句子
            if len(sentence) < 3:
                return False
            
            # 检查是否以标点符号结尾
            if not sentence[-1] in self.sentence_delimiters:
                return False
            
            # 排除常见缩写
            abbreviations = ['Dr.', 'Prof.', 'etc.', 'vs.', 'e.g.', 'i.e.']
            for abbr in abbreviations:
                if sentence.endswith(abbr):
                    return False
            
            return True
            
        except Exception:
            return True
    
    def _has_citations(self, text: str) -> bool:
        """
        检查文本是否包含引用
        
        Args:
            text: 文本
            
        Returns:
            bool: 是否包含引用
        """
        try:
            citation_patterns = [
                r'\^?\[\d+(?:,\s*\d+)*\]\^?',  # [1] 或 ^[1]^
                r'\^\d+\^',                     # ^1^
            ]
            
            for pattern in citation_patterns:
                if re.search(pattern, text):
                    return True
            
            return False
            
        except Exception:
            return False