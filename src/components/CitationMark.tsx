import React from 'react';

interface CitationMarkProps {
  citations: number[];
  className?: string;
  onClick?: (citations: number[]) => void;
}

const CitationMark: React.FC<CitationMarkProps> = ({ 
  citations, 
  className = '', 
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(citations);
    } else {
      // 默认行为：滚动到引用部分
      const referencesSection = document.getElementById('references-section');
      if (referencesSection) {
        referencesSection.scrollIntoView({ behavior: 'smooth' });
        
        // 高亮对应的引用
        citations.forEach(citationId => {
          const refElement = document.getElementById(`reference-${citationId}`);
          if (refElement) {
            refElement.classList.add('highlight-reference');
            setTimeout(() => {
              refElement.classList.remove('highlight-reference');
            }, 3000);
          }
        });
      }
    }
  };

  return (
    <span 
      className={`citation-mark ${className}`}
      onClick={handleClick}
      title={`References: ${citations.join(', ')}`}
    >
      <span className="citation-numbers">
        [{citations.join(',')}]
      </span>
    </span>
  );
};

export default CitationMark;