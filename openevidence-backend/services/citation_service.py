"""
引用服务
管理和处理医学文献引用
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class CitationService:
    """引用服务类"""
    
    def __init__(self):
        """初始化引用服务"""
        self.reference_cache = {}
        logger.info("Citation service initialized")
    
    def get_reference_by_id(self, ref_id: int) -> Optional[Dict]:
        """
        根据ID获取引用详情
        
        Args:
            ref_id: 引用ID
            
        Returns:
            Optional[Dict]: 引用详情
        """
        try:
            # 从缓存中查找
            if ref_id in self.reference_cache:
                return self.reference_cache[ref_id]
            
            # 这里可以从数据库或外部API获取引用详情
            # 目前返回模拟数据
            reference = self._get_mock_reference(ref_id)
            
            if reference:
                self.reference_cache[ref_id] = reference
            
            return reference
            
        except Exception as e:
            logger.error(f"Error getting reference {ref_id}: {str(e)}")
            return None
    
    def cache_references(self, references: List[Dict]) -> None:
        """
        缓存引用列表
        
        Args:
            references: 引用列表
        """
        try:
            for ref in references:
                if 'id' in ref:
                    self.reference_cache[ref['id']] = ref
            
            logger.info(f"Cached {len(references)} references")
            
        except Exception as e:
            logger.error(f"Error caching references: {str(e)}")
    
    def validate_reference(self, reference: Dict) -> bool:
        """
        验证引用信息的完整性
        
        Args:
            reference: 引用信息
            
        Returns:
            bool: 是否有效
        """
        try:
            required_fields = ['id', 'title', 'url']
            
            for field in required_fields:
                if field not in reference or not reference[field]:
                    return False
            
            # 验证URL格式
            url = reference['url']
            if not (url.startswith('http://') or url.startswith('https://')):
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating reference: {str(e)}")
            return False
    
    def enrich_reference(self, reference: Dict) -> Dict:
        """
        丰富引用信息
        
        Args:
            reference: 原始引用信息
            
        Returns:
            Dict: 丰富后的引用信息
        """
        try:
            enriched = reference.copy()
            
            # 添加访问时间
            enriched['accessed_date'] = datetime.now().isoformat()
            
            # 分析期刊影响因子（模拟）
            if 'journal' in enriched:
                enriched['impact_factor'] = self._get_journal_impact_factor(
                    enriched['journal']
                )
            
            # 分析引用质量评分
            enriched['quality_score'] = self._calculate_quality_score(enriched)
            
            return enriched
            
        except Exception as e:
            logger.error(f"Error enriching reference: {str(e)}")
            return reference
    
    def search_references(self, query: str, limit: int = 10) -> List[Dict]:
        """
        搜索引用
        
        Args:
            query: 搜索查询
            limit: 结果限制
            
        Returns:
            List[Dict]: 搜索结果
        """
        try:
            # 从缓存中搜索
            results = []
            query_lower = query.lower()
            
            for ref in self.reference_cache.values():
                if (query_lower in ref.get('title', '').lower() or
                    query_lower in ref.get('authors', '').lower() or
                    query_lower in ref.get('journal', '').lower()):
                    results.append(ref)
            
            # 按相关性排序
            results.sort(key=lambda x: x.get('relevanceScore', 0), reverse=True)
            
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Error searching references: {str(e)}")
            return []
    
    def get_citation_statistics(self) -> Dict:
        """
        获取引用统计信息
        
        Returns:
            Dict: 统计信息
        """
        try:
            total_refs = len(self.reference_cache)
            
            # 按类型统计
            type_counts = {}
            journal_counts = {}
            year_counts = {}
            
            for ref in self.reference_cache.values():
                # 类型统计
                ref_type = ref.get('type', 'unknown')
                type_counts[ref_type] = type_counts.get(ref_type, 0) + 1
                
                # 期刊统计
                journal = ref.get('journal', 'unknown')
                journal_counts[journal] = journal_counts.get(journal, 0) + 1
                
                # 年份统计
                pub_date = ref.get('publishedDate', '')
                year = pub_date[:4] if len(pub_date) >= 4 else 'unknown'
                year_counts[year] = year_counts.get(year, 0) + 1
            
            return {
                'total_references': total_refs,
                'by_type': type_counts,
                'by_journal': dict(list(journal_counts.items())[:10]),  # 前10个期刊
                'by_year': year_counts,
                'cache_size': total_refs,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting citation statistics: {str(e)}")
            return {'error': 'Unable to generate statistics'}
    
    def _get_mock_reference(self, ref_id: int) -> Optional[Dict]:
        """
        获取模拟引用数据
        
        Args:
            ref_id: 引用ID
            
        Returns:
            Optional[Dict]: 模拟引用数据
        """
        mock_references = {
            1: {
                'id': 1,
                'title': 'Antibiotics or No Antibiotics, That Is the Question: An Update on Efficient and Effective Use of Antibiotics in Dental Practice',
                'title_zh': '抗生素或没有抗生素，这是一个问题: 在牙科实践中有效和有效使用抗生素的更新',
                'url': 'https://pubmed.ncbi.nlm.nih.gov/34065113/',
                'authors': 'Buonavoglia A, Leone P, Solimando AG, et al.',
                'journal': 'Antibiotics (Basel)',
                'publishedDate': '2021-05-09',
                'doi': '10.3390/antibiotics10050550',
                'pmid': '34065113',
                'type': 'review',
                'isLeading': False,
                'isNew': False,
                'relevanceScore': 0.95,
                'abstract': 'This review discusses the current evidence on antibiotic use in dental practice...',
                'evidenceClass': 'Literature Review'
            },
            2: {
                'id': 2,
                'title': 'The role of antibiotics in preventing surgical complications in periodontology and implant dentistry',
                'title_zh': '抗生素在预防牙周病学和种植牙科手术并发症中的作用',
                'url': 'https://pubmed.ncbi.nlm.nih.gov/40665923/',
                'authors': 'Chen Z, Chiou LL, Calatrava J, Wang HL',
                'journal': 'Periodontol 2000',
                'publishedDate': '2025-07-16',
                'doi': '10.1111/prd.12636',
                'type': 'meta-analysis',
                'isLeading': True,
                'isNew': True,
                'relevanceScore': 0.98,
                'abstract': 'Systematic review of antibiotic prophylaxis in periodontal and implant surgery...',
                'evidenceClass': 'Systematic Review'
            }
        }
        
        return mock_references.get(ref_id)
    
    def _get_journal_impact_factor(self, journal_name: str) -> float:
        """
        获取期刊影响因子（模拟）
        
        Args:
            journal_name: 期刊名称
            
        Returns:
            float: 影响因子
        """
        # 模拟影响因子数据
        impact_factors = {
            'Nature': 49.962,
            'Science': 47.728,
            'Cell': 41.582,
            'Lancet': 79.321,
            'NEJM': 91.245,
            'JAMA': 56.272,
            'BMJ': 39.890,
            'Cochrane Database Syst Rev': 11.874,
            'Periodontol 2000': 6.827,
            'Antibiotics (Basel)': 4.927
        }
        
        # 模糊匹配
        for journal, factor in impact_factors.items():
            if journal.lower() in journal_name.lower():
                return factor
        
        return 2.5  # 默认影响因子
    
    def _calculate_quality_score(self, reference: Dict) -> float:
        """
        计算引用质量评分
        
        Args:
            reference: 引用信息
            
        Returns:
            float: 质量评分 (0-10)
        """
        try:
            score = 5.0  # 基础分
            
            # 期刊影响因子加分
            impact_factor = reference.get('impact_factor', 0)
            if impact_factor > 10:
                score += 2.0
            elif impact_factor > 5:
                score += 1.0
            elif impact_factor > 2:
                score += 0.5
            
            # 证据类型加分
            evidence_type = reference.get('type', '')
            if evidence_type == 'meta-analysis':
                score += 1.5
            elif evidence_type == 'research':
                score += 1.0
            elif evidence_type == 'guideline':
                score += 1.2
            
            # 发表时间加分（越新越好）
            pub_date = reference.get('publishedDate', '')
            if pub_date:
                try:
                    year = int(pub_date[:4])
                    current_year = datetime.now().year
                    if year >= current_year - 1:
                        score += 1.0
                    elif year >= current_year - 3:
                        score += 0.5
                except ValueError:
                    pass
            
            # 顶级期刊加分
            if reference.get('isLeading', False):
                score += 1.0
            
            return min(score, 10.0)  # 最高10分
            
        except Exception as e:
            logger.error(f"Error calculating quality score: {str(e)}")
            return 5.0