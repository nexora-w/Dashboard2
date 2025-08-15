import { Download, ChevronDown, FileText, FileSpreadsheet, FileJson, X, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import * as XLSX from 'xlsx';

interface User {
  name: string;
  email: string;
}

type ExportStep = 'idle' | 'fetching' | 'converting' | 'downloading' | 'completed' | 'error';

const ExportButton = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<ExportStep>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const createJSONBlob = (data: User[]): Blob => {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  };

  const createCSVBlob = (data: User[]): Blob => {
    if (data.length === 0) {
      return new Blob([''], { type: 'text/csv' });
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header as keyof User];
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escapedValue = String(value).replace(/"/g, '""');
          return `"${escapedValue}"`;
        }).join(',')
      )
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  };

  const createExcelBlob = (data: User[]): Blob => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    
    // Convert to blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setIsDropdownOpen(false);
    setShowModal(true);
    setCurrentStep('fetching');
    setErrorMessage('');

    try {
      // Step 1: Fetching data
      setCurrentStep('fetching');
      const response = await fetch("/api/cs2dle/users/export");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      // Step 2: Converting data
      setCurrentStep('converting');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate conversion time
      
      let blob: Blob;
      let filename: string;
      
      switch (format) {
        case 'json':
          blob = createJSONBlob(data);
          filename = 'users.json';
          break;
        case 'csv':
          blob = createCSVBlob(data);
          filename = 'users.csv';
          break;
        case 'excel':
          blob = createExcelBlob(data);
          filename = 'users.xlsx';
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Step 3: Downloading
      setCurrentStep('downloading');
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate download time
      
      downloadFile(blob, filename);

      // Step 4: Completed
      setCurrentStep('completed');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show success for 1 second
      
      setShowModal(false);
      setCurrentStep('idle');

    } catch (error) {
      console.error('Export error:', error);
      setCurrentStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const formatOptions = [
    {
      id: 'json',
      label: 'JSON',
      icon: FileJson,
      description: 'Structured data format',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'csv',
      label: 'CSV',
      icon: FileText,
      description: 'Spreadsheet compatible',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'excel',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Microsoft Excel format',
      color: 'text-emerald-600 dark:text-emerald-400'
    }
  ];

  const getStepIcon = (step: ExportStep, isCompleted: boolean = false) => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
    }
    
    switch (step) {
      case 'fetching':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-blue-400" />;
      case 'converting':
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-500 dark:text-yellow-400" />;
      case 'downloading':
        return <Loader2 className="w-5 h-5 animate-spin text-green-500 dark:text-green-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500 dark:text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
    }
  };

  const getStepText = (step: ExportStep) => {
    switch (step) {
      case 'fetching':
        return 'Fetching data from database...';
      case 'converting':
        return 'Converting to selected format...';
      case 'downloading':
        return 'Preparing download...';
      case 'completed':
        return 'Export completed successfully!';
      case 'error':
        return 'Export failed';
      default:
        return '';
    }
  };

  const getStepStatus = (stepName: string) => {
    const stepOrder = ['fetching', 'converting', 'downloading'];
    const currentStepIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepName);
    
    if (currentStep === 'error') {
      return stepIndex <= currentStepIndex ? 'error' : 'pending';
    }
    
    if (currentStep === 'completed') {
      return 'completed';
    }
    
    if (stepIndex < currentStepIndex) {
      return 'completed';
    } else if (stepIndex === currentStepIndex) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button 
            className={`
              group relative flex items-center gap-2 px-4 py-3 
              bg-gradient-to-r from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700 
              dark:from-orange-600 dark:to-orange-700
              dark:hover:from-orange-700 dark:hover:to-orange-800
              text-white font-medium rounded-xl shadow-lg 
              hover:shadow-xl transform hover:scale-105 
              transition-all duration-200 ease-out
            `}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Download className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="z-[9999999] absolute bottom-full right-0 mb-3 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Choose Format
                </div>
                {formatOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      className="w-full flex items-center gap-3 px-3 py-3 cursor-pointer text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150 group"
                      onClick={() => handleExport(option.id as 'json' | 'csv' | 'excel')}
                    >
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-150`}>
                        <IconComponent className={`w-4 h-4 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {/* Export Progress Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-96 max-w-[90vw] mx-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Exporting Data</h3>
              {currentStep !== 'fetching' && currentStep !== 'converting' && currentStep !== 'downloading' && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCurrentStep('idle');
                    setErrorMessage('');
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Progress Steps */}
              <div className="space-y-3">
                {['fetching', 'converting', 'downloading'].map((step) => {
                  const stepStatus = getStepStatus(step);
                  const isActive = currentStep === step;
                  const isCompleted = stepStatus === 'completed';
                  
                  return (
                    <div key={step} className="flex items-center gap-3">
                      {getStepIcon(step as ExportStep, isCompleted)}
                      <span className={`text-sm ${
                        isActive ? 'text-gray-900 dark:text-gray-100 font-medium' : 
                        isCompleted ? 'text-green-600 dark:text-green-400 font-medium' : 
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {isCompleted ? 
                          step === 'fetching' ? 'Data fetched successfully' :
                          step === 'converting' ? 'Format conversion completed' :
                          'Download prepared successfully' :
                          getStepText(step as ExportStep)
                        }
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Message */}
              {currentStep === 'completed' && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">File downloaded successfully!</span>
                </div>
              )}

              {currentStep === 'error' && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-300">{errorMessage}</span>
                </div>
              )}

              {/* Progress Bar */}
              {(currentStep === 'fetching' || currentStep === 'converting' || currentStep === 'downloading') && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      currentStep === 'fetching' ? 'w-1/3 bg-blue-500 dark:bg-blue-400' :
                      currentStep === 'converting' ? 'w-2/3 bg-yellow-500 dark:bg-yellow-400' :
                      'w-full bg-green-500 dark:bg-green-400'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportButton;
