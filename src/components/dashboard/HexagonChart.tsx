import { useEffect, useRef } from 'react';
import { GameResult, GameType, GAME_TYPES } from '@/types';

interface HexagonChartProps {
  gameResults: Record<GameType, number | null>;
  className?: string;
}

export function HexagonChart({ gameResults, className = "" }: HexagonChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(svgWidth, svgHeight) * 0.4; // Slightly smaller to leave room for labels
    
    // Clear existing content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Create background grid (3 levels)
    for (let level = 1; level <= 3; level++) {
      const points = calculatePolygonPoints(centerX, centerY, radius * (level / 3), 6);
      const gridPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      gridPolygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
      gridPolygon.setAttribute('class', 'hexagon-chart-axis');
      svg.appendChild(gridPolygon);
    }
    
    // Create axes
    const axisCount = 6;
    const gameTypes = Object.keys(GAME_TYPES) as GameType[];
    
    for (let i = 0; i < axisCount; i++) {
      const angle = (Math.PI / 2) + (i * (2 * Math.PI / axisCount));
      const x2 = centerX + radius * Math.cos(angle);
      const y2 = centerY - radius * Math.sin(angle);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX.toString());
      line.setAttribute('y1', centerY.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('class', 'hexagon-chart-axis');
      svg.appendChild(line);
      
      // Add labels
      const getOffsetForGameType = (type: GameType) => {
        switch (type) {
          case 'WM':
          case 'PS':
            return 1.1; // 숫자기억, 정보처리
          default:
            return 1.2; // 반응속도, 패턴기억, 주의집중, 의사결정
        }
      };

      const labelOffset = getOffsetForGameType(gameTypes[i]);
      const labelX = centerX + radius * labelOffset * Math.cos(angle);
      const labelY = centerY - radius * labelOffset * Math.sin(angle);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX.toString());
      text.setAttribute('y', labelY.toString());
      text.setAttribute('class', 'hexagon-chart-label');
      text.textContent = GAME_TYPES[gameTypes[i]].name;
      svg.appendChild(text);
    }
    
    // Create data polygon based on normalized performance data
    const dataPoints = gameTypes.map((type, i) => {
      const angle = (Math.PI / 2) + (i * (2 * Math.PI / axisCount));
      // Normalize the score between 0 and 1 (0 at center, 1 at full radius)
      const normalizedScore = (gameResults[type] ?? 0) / 100;
      const distance = radius * Math.max(0.1, Math.min(1, normalizedScore)); // Min 10% visible, max 100%
      
      return {
        x: centerX + distance * Math.cos(angle),
        y: centerY - distance * Math.sin(angle)
      };
    });
    
    const dataPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    dataPolygon.setAttribute('points', dataPoints.map(p => `${p.x},${p.y}`).join(' '));
    dataPolygon.setAttribute('class', 'hexagon-chart-polygon');
    svg.appendChild(dataPolygon);
  }, [gameResults]);
  
  // Helper function to calculate polygon points
  function calculatePolygonPoints(centerX: number, centerY: number, radius: number, sides: number) {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI / 2) + (i * (2 * Math.PI / sides));
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY - radius * Math.sin(angle)
      });
    }
    return points;
  }

  return (
    <div className={`hexagon-chart ${className}`}>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 300 300"></svg>
    </div>
  );
}
