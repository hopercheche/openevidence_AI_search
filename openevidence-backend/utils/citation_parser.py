"""
引用解析工具
处理 Baichuan M2 Plus 模型返回的引用信息
"""

import re
import logging
from typing import List, Dict, Tuple, Any

logger = logging.getLogger(__name__)

class CitationParser:
    """引用解析器"""
    
    def __init__(self):
        """初始化引用解析器"""
        # 引用标记的正则表达式模式
        self.citation_patterns = [
            r'\^?\[(\d+(?:,\s*\d+)*)\]\^?',  # ^[1]^ 或 [1,2,3] 格式
            r'\^(\d+)\^',                    # ^1^ 格式
            r'\[(\d+)\]',                    # [1] 格式
        ]
        
        logger.info("Citation parser initialized")
    
    def parse_baichuan_references(self, evidence_list: List[Dict]) -> List[Dict]:
        """
        解析 Baichuan 模型返回的引用信息
        
        Args:
            evidence_list: Baichuan 返回的 evidence 列表
            
        Returns:
            List[Dict]: 标准化的引用信息列表
        """
        try:
            references = []
            
            for evidence in evidence_list:
                ref = {
                    'id': evidence.get('ref_num', 0),
                    'title': evidence.get('title', ''),
                    'title_zh': evidence.get('title_zh', ''),
                    'url': evidence.get('url', ''),
                    'authors': evidence.get('author', ''),
                    'journal': self._extract_journal_name(evidence.get('publication_info', '')),
                    'publishedDate': self._extract_publication_date(evidence.get('publication_info', '')),
                    'doi': self._extract_doi(evidence.get('publication_info', '')),
                    'pmid': self._extract_pmid(evidence.get('url', '')),
                    'type': self._classify_evidence_type(evidence.get('evidence_class', '')),
                    'isLeading': self._is_leading_journal(evidence.get('publication_info', '')),
                    'isNew': self._is_recent_publication(evidence.get('publication_info', '')),
                    'relevanceScore': 0.9,  # 默认高相关性
                    'abstract': evidence.get('abstract', ''),
                    'evidenceClass': evidence.get('evidence_class', '')
                }
                
                references.append(ref)
            
            # 按引用编号排序
            references.sort(key=lambda x: x['id'])
            
            logger.info(f"Parsed {len(references)} references from Baichuan response")
            return references
            
        except Exception as e:
            logger.error(f"Error parsing Baichuan references: {str(e)}")
            return []
    
    def extract_citations_from_text(self, text: str, references: List[Dict]) -> Tuple[str, List[int]]:
        """
        从文本中提取引用标记
        
        Args:
            text: 输入文本
            references: 引用列表
            
        Returns:
            Tuple[str, List[int]]: (处理后的文本, 引用编号列表)
        """
        try:
            citations = []
            processed_text = text
            
            # 查找所有引用模式
            for pattern in self.citation_patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    citation_str = match.group(1)
                    
                    # 解析引用编号
                    if ',' in citation_str:
                        # 多个引用：[1,2,3]
                        citation_nums = [int(num.strip()) for num in citation_str.split(',')]
                    else:
                        # 单个引用：[1]
                        citation_nums = [int(citation_str)]
                    
                    citations.extend(citation_nums)
            
            # 去重并排序
            citations = sorted(list(set(citations)))
            
            # 验证引用编号是否存在于引用列表中
            valid_citations = []
            for cite_num in citations:
                if any(ref['id'] == cite_num for ref in references):
                    valid_citations.append(cite_num)
            
            return processed_text, valid_citations
            
        except Exception as e:
            logger.error(f"Error extracting citations from text: {str(e)}")
            return text, []
    
    def segment_text_with_citations(self, text: str, references: List[Dict]) -> List[Dict]:
        """
        将文本按引用分段
        
        Args:
            text: 完整文本
            references: 引用列表
            
        Returns:
            List[Dict]: 分段信息列表
        """
        try:
            segments = []
            current_pos = 0
            
            # 查找所有引用位置
            citation_positions = []
            
            for pattern in self.citation_patterns:
                for match in re.finditer(pattern, text):
                    citation_str = match.group(1)
                    if ',' in citation_str:
                        citation_nums = [int(num.strip()) for num in citation_str.split(',')]
                    else:
                        citation_nums = [int(citation_str)]
                    
                    citation_positions.append({
                        'start': match.start(),
                        'end': match.end(),
                        'citations': citation_nums,
                        'original': match.group(0)
                    })
            
            # 按位置排序
            citation_positions.sort(key=lambda x: x['start'])
            
            # 分段处理
            for i, citation_pos in enumerate(citation_positions):
                # 添加引用前的文本段
                if citation_pos['start'] > current_pos:
                    segment_text = text[current_pos:citation_pos['start']].strip()
                    if segment_text:
                        segments.append({
                            'text': segment_text,
                            'citations': [],
                            'type': 'content'
                        })
                
                # 查找引用后的句子结束位置
                sentence_end = self._find_sentence_end(text, citation_pos['end'])
                
                # 添加带引用的文本段
                segment_text = text[citation_pos['start']:sentence_end].strip()
                # 移除引用标记
                clean_text = re.sub(r'\^?\[\d+(?:,\s*\d+)*\]\^?', '', segment_text).strip()
                
                if clean_text:
                    segments.append({
                        'text': clean_text,
                        'citations': citation_pos['citations'],
                        'type': 'cited_content'
                    })
                
                current_pos = sentence_end
            
            # 添加剩余文本
            if current_pos < len(text):
                remaining_text = text[current_pos:].strip()
                if remaining_text:
                    segments.append({
                        'text': remaining_text,
                        'citations': [],
                        'type': 'content'
                    })
            
            logger.info(f"Segmented text into {len(segments)} segments")
            return segments
            
        except Exception as e:
            logger.error(f"Error segmenting text with citations: {str(e)}")
            return [{'text': text, 'citations': [], 'type': 'content'}]
    
    def _find_sentence_end(self, text: str, start_pos: int) -> int:
        """
        查找句子结束位置
        
        Args:
            text: 文本
            start_pos: 开始位置
            
        Returns:
            int: 句子结束位置
        """
        try:
            # 查找句号、问号、感叹号
            sentence_endings = ['。', '？', '！', '.', '?', '!']
            
            for i in range(start_pos, len(text)):
                if text[i] in sentence_endings:
                    return i + 1
            
            # 如果没找到句号，查找换行符
            newline_pos = text.find('\n', start_pos)
            if newline_pos != -1:
                return newline_pos
            
            # 默认返回文本结尾
            return len(text)
            
        except Exception:
            return len(text)
    
    def _extract_journal_name(self, publication_info: str) -> str:
        """提取期刊名称"""
        try:
            if not publication_info:
                return 'Unknown Journal'
            
            # 期刊名通常在第一个点之前
            parts = publication_info.split('.')
            if parts:
                journal = parts[0].strip()
                # 移除年份信息
                journal = re.sub(r'\s+\d{4}.*$', '', journal)
                return journal
            
            return publication_info
            
        except Exception:
            return 'Unknown Journal'
    
    def _extract_publication_date(self, publication_info: str) -> str:
        """提取发表日期"""
        try:
            # 查找日期模式
            date_patterns = [
                r'(\d{4})\s+[A-Za-z]+\s+(\d{1,2})',  # 2024 Jan 15
                r'(\d{4})-(\d{1,2})-(\d{1,2})',      # 2024-01-15
                r'(\d{4})\s+[A-Za-z]+',              # 2024 Jan
                r'(\d{4})',                          # 2024
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, publication_info)
                if match:
                    groups = match.groups()
                    if len(groups) >= 3:
                        return f"{groups[0]}-{groups[1].zfill(2)}-{groups[2].zfill(2)}"
                    elif len(groups) == 2:
                        return f"{groups[0]}-{groups[1].zfill(2)}-01"
                    else:
                        return f"{groups[0]}-01-01"
            
            return "2024-01-01"
            
        except Exception:
            return "2024-01-01"
    
    def _extract_doi(self, publication_info: str) -> str:
        """提取 DOI"""
        try:
            doi_match = re.search(r'doi:\s*([^\s]+)', publication_info, re.IGNORECASE)
            return doi_match.group(1) if doi_match else ''
        except Exception:
            return ''
    
    def _extract_pmid(self, url: str) -> str:
        """从 URL 提取 PMID"""
        try:
            pmid_match = re.search(r'pubmed\.ncbi\.nlm\.nih\.gov/(\d+)', url)
            return pmid_match.group(1) if pmid_match else ''
        except Exception:
            return ''
    
    def _classify_evidence_type(self, evidence_class: str) -> str:
        """分类证据类型"""
        type_mapping = {
            'RCT': 'research',
            'Randomized Controlled Trial': 'research',
            'Systematic Review': 'meta-analysis',
            'Meta-Analysis': 'meta-analysis',
            'Literature Review': 'review',
            'Narrative Review': 'review',
            'Guideline': 'guideline',
            'Clinical Guideline': 'guideline',
            'Case Study': 'research',
            'Cohort Study': 'research',
            'Cross-sectional Study': 'research'
        }
        
        return type_mapping.get(evidence_class, 'research')
    
    def _is_leading_journal(self, publication_info: str) -> bool:
        """判断是否为顶级期刊"""
        leading_journals = [
            'Nature', 'Science', 'Cell', 'Lancet', 'NEJM', 'New England Journal of Medicine',
            'JAMA', 'BMJ', 'British Medical Journal', 'Cochrane', 'PLoS Medicine',
            'Annals of Internal Medicine', 'Journal of Clinical Investigation',
            'Nature Medicine', 'Nature Reviews', 'Cell Medicine'
        ]
        
        pub_lower = publication_info.lower()
        return any(journal.lower() in pub_lower for journal in leading_journals)
    
    def _is_recent_publication(self, publication_info: str) -> bool:
        """判断是否为近期发表（2022年及以后）"""
        try:
            year_match = re.search(r'(\d{4})', publication_info)
            if year_match:
                year = int(year_match.group(1))
                return year >= 2022
            return False
        except Exception:
            return False