import React, { useState } from 'react';
import { Upload, BarChart3, TrendingUp, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const DataAnalysisDashboard = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample datasets
  const sampleDatasets = {
    sales: `Date,Product,Category,Sales,Quantity,Region
2024-01-15,Laptop,Electronics,1200,2,North
2024-01-16,Mouse,Electronics,25,5,South
2024-01-17,Keyboard,Electronics,75,3,East
2024-01-18,Monitor,Electronics,300,1,West
2024-01-19,Laptop,Electronics,1200,1,North
2024-01-20,Desk,Furniture,450,2,South
2024-01-21,Chair,Furniture,200,4,East
2024-01-22,Lamp,Furniture,50,3,West
2024-01-23,Mouse,Electronics,25,10,North
2024-01-24,Keyboard,Electronics,75,5,South`,
    customers: `CustomerID,Age,Gender,Income,SpendingScore,MembershipYears
C001,25,M,45000,65,2
C002,35,F,65000,78,5
C003,28,M,52000,45,1
C004,42,F,85000,92,8
C005,31,M,48000,55,3
C006,38,F,72000,85,6
C007,29,M,55000,40,2
C008,45,F,95000,88,10
C009,33,M,58000,62,4
C010,27,F,48000,50,1`
  };

  // Mock analysis function that simulates pandas analysis
  const analyzeCsvWithClaude = async (csvContent) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Parse CSV
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const dataRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, idx) => {
          obj[header] = values[idx];
          return obj;
        }, {});
      });

      // Analyze each column
      const columnAnalysis = headers.map(header => {
        const values = dataRows.map(row => row[header]).filter(v => v !== '' && v !== undefined);
        const uniqueValues = [...new Set(values)];
        const missing = dataRows.length - values.length;
        
        // Determine if numeric or categorical
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        const isNumeric = numericValues.length === values.length && numericValues.length > 0;
        
        if (isNumeric) {
          // Numeric column
          const sorted = numericValues.sort((a, b) => a - b);
          const sum = sorted.reduce((a, b) => a + b, 0);
          const mean = sum / sorted.length;
          const median = sorted.length % 2 === 0 
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
          
          const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length;
          const std = Math.sqrt(variance);
          
          return {
            name: header,
            type: "numeric",
            missing: missing,
            unique: uniqueValues.length,
            stats: {
              mean: mean,
              median: median,
              std: std,
              min: Math.min(...sorted),
              max: Math.max(...sorted)
            }
          };
        } else {
          // Categorical column
          const valueCounts = {};
          values.forEach(v => {
            valueCounts[v] = (valueCounts[v] || 0) + 1;
          });
          
          const topValues = Object.entries(valueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([value, count]) => ({ value, count }));
          
          return {
            name: header,
            type: "categorical",
            missing: missing,
            unique: uniqueValues.length,
            stats: {
              min: uniqueValues[0],
              max: uniqueValues[uniqueValues.length - 1],
              topValues: topValues
            }
          };
        }
      });

      // Generate insights
      const insights = [];
      const totalCells = dataRows.length * headers.length;
      const totalMissing = columnAnalysis.reduce((acc, col) => acc + col.missing, 0);
      const dataQuality = Math.round((1 - totalMissing / totalCells) * 100);
      
      insights.push(`Dataset contains ${dataRows.length} rows and ${headers.length} columns`);
      insights.push(`Data quality score: ${dataQuality}% (${totalMissing} missing values)`);
      
      const numericColumns = columnAnalysis.filter(c => c.type === 'numeric');
      const categoricalColumns = columnAnalysis.filter(c => c.type === 'categorical');
      
      if (numericColumns.length > 0) {
        insights.push(`${numericColumns.length} numeric columns detected for statistical analysis`);
      }
      if (categoricalColumns.length > 0) {
        insights.push(`${categoricalColumns.length} categorical columns identified for grouping operations`);
      }

      // Calculate correlations for numeric columns
      const correlations = [];
      for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i].name;
          const col2 = numericColumns[j].name;
          
          const vals1 = dataRows.map(row => parseFloat(row[col1])).filter(v => !isNaN(v));
          const vals2 = dataRows.map(row => parseFloat(row[col2])).filter(v => !isNaN(v));
          
          if (vals1.length === vals2.length && vals1.length > 0) {
            const mean1 = vals1.reduce((a, b) => a + b, 0) / vals1.length;
            const mean2 = vals2.reduce((a, b) => a + b, 0) / vals2.length;
            
            let numerator = 0;
            let denom1 = 0;
            let denom2 = 0;
            
            for (let k = 0; k < vals1.length; k++) {
              const diff1 = vals1[k] - mean1;
              const diff2 = vals2[k] - mean2;
              numerator += diff1 * diff2;
              denom1 += diff1 * diff1;
              denom2 += diff2 * diff2;
            }
            
            const correlation = numerator / Math.sqrt(denom1 * denom2);
            
            if (Math.abs(correlation) > 0.3) {
              correlations.push({
                col1: col1,
                col2: col2,
                value: correlation
              });
            }
          }
        }
      }

      if (correlations.length > 0) {
        insights.push(`Found ${correlations.length} significant correlations between numeric variables`);
      }

      // Generate visualization data
      const distributions = numericColumns.slice(0, 2).map(col => {
        const values = dataRows.map(row => parseFloat(row[col.name])).filter(v => !isNaN(v));
        const sorted = values.sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const range = max - min;
        const binSize = range / 4;
        
        const bins = [
          { bin: `${min.toFixed(0)}-${(min + binSize).toFixed(0)}`, count: 0 },
          { bin: `${(min + binSize).toFixed(0)}-${(min + 2*binSize).toFixed(0)}`, count: 0 },
          { bin: `${(min + 2*binSize).toFixed(0)}-${(min + 3*binSize).toFixed(0)}`, count: 0 },
          { bin: `${(min + 3*binSize).toFixed(0)}-${max.toFixed(0)}`, count: 0 }
        ];
        
        values.forEach(v => {
          const binIndex = Math.min(Math.floor((v - min) / binSize), 3);
          bins[binIndex].count++;
        });
        
        return {
          column: col.name,
          data: bins
        };
      });

      const categoryCharts = categoricalColumns.slice(0, 3).map(col => {
        const valueCounts = {};
        dataRows.forEach(row => {
          const val = row[col.name];
          if (val) {
            valueCounts[val] = (valueCounts[val] || 0) + 1;
          }
        });
        
        const data = Object.entries(valueCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([category, count]) => ({ category, count }));
        
        return {
          column: col.name,
          data: data
        };
      });

      const analysisResult = {
        overview: {
          rows: dataRows.length,
          columns: headers.length,
          columnNames: headers
        },
        columns: columnAnalysis,
        insights: insights,
        correlations: correlations,
        visualizationData: {
          distributions: distributions,
          categoryCharts: categoryCharts
        }
      };

      setAnalysis(analysisResult);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(`Failed to analyze data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFile(uploadedFile.name);
        analyzeCsvWithClaude(content);
      };
      reader.readAsText(uploadedFile);
    } else {
      setError("Please upload a valid CSV file");
    }
  };

  const loadSampleDataset = (datasetName) => {
    setFile(`Sample: ${datasetName}`);
    analyzeCsvWithClaude(sampleDatasets[datasetName]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <BarChart3 className="text-indigo-600" size={40} />
            Data Analysis Dashboard
          </h1>
          <p className="text-gray-600">by Jason Decker | Powered by Python Pandas</p>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <Upload className="mx-auto text-indigo-600 mb-4" size={48} />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upload Your Dataset</h2>
              <p className="text-gray-600 mb-4">Upload a CSV file or try a sample dataset</p>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-indigo-700 transition"
              >
                Choose CSV File
              </label>
            </div>

            <div className="border-t pt-6">
              <p className="text-center text-gray-600 mb-4 font-medium">Or try a sample dataset:</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => loadSampleDataset('sales')}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Sales Data
                </button>
                <button
                  onClick={() => loadSampleDataset('customers')}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition"
                >
                  Customer Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Analyzing your data with pandas...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div>
            {/* File Info Bar */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="text-indigo-600" size={24} />
                <div>
                  <p className="font-semibold text-gray-800">{file}</p>
                  <p className="text-sm text-gray-600">
                    {analysis.overview.rows} rows × {analysis.overview.columns} columns
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                  setActiveTab('overview');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                New Analysis
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-xl shadow-lg">
              <div className="flex border-b">
                {['overview', 'columns', 'insights', 'visualizations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-semibold capitalize transition ${
                      activeTab === tab
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                        <p className="text-sm opacity-90 mb-1">Total Rows</p>
                        <p className="text-3xl font-bold">{analysis.overview.rows}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                        <p className="text-sm opacity-90 mb-1">Total Columns</p>
                        <p className="text-3xl font-bold">{analysis.overview.columns}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
                        <p className="text-sm opacity-90 mb-1">Data Quality</p>
                        <p className="text-3xl font-bold">
                          {Math.round((1 - analysis.columns.reduce((acc, col) => acc + col.missing, 0) / 
                          (analysis.overview.rows * analysis.overview.columns)) * 100)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Columns in Dataset</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.overview.columnNames.map((col, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Columns Tab */}
                {activeTab === 'columns' && (
                  <div className="space-y-4">
                    {analysis.columns.map((col, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">{col.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            col.type === 'numeric' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {col.type}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Missing</p>
                            <p className="text-lg font-semibold">{col.missing}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Unique</p>
                            <p className="text-lg font-semibold">{col.unique}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Min</p>
                            <p className="text-lg font-semibold">{col.stats.min}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Max</p>
                            <p className="text-lg font-semibold">{col.stats.max}</p>
                          </div>
                        </div>

                        {col.type === 'numeric' && (
                          <div className="grid grid-cols-3 gap-4 bg-white p-3 rounded">
                            <div>
                              <p className="text-sm text-gray-600">Mean</p>
                              <p className="font-semibold">{col.stats.mean?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Median</p>
                              <p className="font-semibold">{col.stats.median?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Std Dev</p>
                              <p className="font-semibold">{col.stats.std?.toFixed(2)}</p>
                            </div>
                          </div>
                        )}

                        {col.type === 'categorical' && col.stats.topValues && (
                          <div className="bg-white p-3 rounded">
                            <p className="text-sm text-gray-600 mb-2">Top Values:</p>
                            <div className="space-y-1">
                              {col.stats.topValues.map((tv, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="font-medium">{tv.value}</span>
                                  <span className="text-gray-600">({tv.count})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Findings</h3>
                      <div className="space-y-3">
                        {analysis.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                            <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                            <p className="text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analysis.correlations && analysis.correlations.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Correlations</h3>
                        <div className="space-y-2">
                          {analysis.correlations.map((corr, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-800">{corr.col1}</span>
                                <span className="text-gray-600 mx-2">↔</span>
                                <span className="font-medium text-gray-800">{corr.col2}</span>
                              </div>
                              <span className={`font-bold ${
                                Math.abs(corr.value) > 0.7 ? 'text-red-600' :
                                Math.abs(corr.value) > 0.4 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {corr.value.toFixed(3)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Visualizations Tab */}
                {activeTab === 'visualizations' && (
                  <div className="space-y-8">
                    {analysis.visualizationData?.distributions?.map((dist, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Distribution: {dist.column}
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={dist.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="bin" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4F46E5" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ))}

                    {analysis.visualizationData?.categoryCharts?.map((chart, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Category Count: {chart.column}
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8B5CF6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalysisDashboard;