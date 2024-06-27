import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { toPng } from 'html-to-image'; // Import only the toPng function
import download from 'downloadjs';
import './Chart.css';

interface DataPoint {
  timestamp: string;
  value: number;
}

const Chart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>('daily');
  const [zoom, setZoom] = useState<number>(1);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: DataPoint[]) => setData(data))
      .catch(error => console.error('There was a problem with the fetch operation:', error));
  }, []);

  useEffect(() => {
    const now = moment();
    let filtered;
    switch (timeframe) {
      case 'weekly':
        filtered = data.filter(d => moment(d.timestamp).isAfter(now.subtract(1, 'week')));
        break;
      case 'monthly':
        filtered = data.filter(d => moment(d.timestamp).isAfter(now.subtract(1, 'month')));
        break;
      default:
        filtered = data;
    }
    setFilteredData(filtered.slice(0, Math.floor(filtered.length / zoom)));
  }, [timeframe, data, zoom]);

  const handleClick = (data: any) => {
    alert(`You clicked on data point at timestamp: ${data.payload.timestamp} with value: ${data.payload.value}`);
  };

  const exportChart = () => {
    if (chartRef.current === null) {
      return;
    }

    toPng(chartRef.current)
      .then((dataUrl) => {
        download(dataUrl, 'chart.png');
      })
      .catch((error) => {
        console.error('Error exporting the chart:', error);
      });
  };

  return (
    <div className="chart-container">
      <div className="button-group">
        <button className='daily button' onClick={() => setTimeframe('daily')}>Daily</button>
        <button className='week button' onClick={() => setTimeframe('weekly')}>Weekly</button>
        <button className='month button' onClick={() => setTimeframe('monthly')}>Monthly</button>
      </div>
      <div className="button-group">
        <button className='week button' onClick={() => setZoom(prev => Math.max(1, prev - 1))}>Zoom In</button>
        <button className='week button' onClick={() => setZoom(prev => prev + 1)}>Zoom Out</button>
        <button className='png button' onClick={exportChart}>Export as PNG</button>
      </div>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={(tick) => moment(tick).format('MMM DD')} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} onClick={handleClick} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Chart;
