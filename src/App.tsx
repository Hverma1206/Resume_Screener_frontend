import React, { useState } from 'react';
import { Upload, FileText, Users, CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';

interface MatchResult {
  match: string;
  summary: string;
}


function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file only.');
      setResumeFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    } 
    
    if (!resumeFile) {
      setError('Please upload a resume.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch(import.meta.env.VITE_LAMBDA_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractAndSendEmail = async () => {
    if (!resumeFile) {
      setEmailError('Please upload a resume to extract email from.');
      return;
    }

    setIsSendingEmail(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', 'Email extraction'); 
      const analyzeResponse = await fetch(`${import.meta.env.VITE_NODEMAILER_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!analyzeResponse.ok) {
        throw new Error(`Error: ${analyzeResponse.status}`);
      }

      const analyzeData = await analyzeResponse.json();
      const extractedEmail = analyzeData.email;

      if (!extractedEmail) {
        throw new Error('No email found in the resume');
      }

      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Resume Match Results</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Resume Matcher</h1>
            </div>
            <div style="padding: 20px 0;">
              <p>Dear Applicant,</p>
              <p>Thank you for using our Resume Matcher service. We have analyzed your resume against the job description you provided.</p>
              
              ${result ? `
              <div style="background-color: ${parseInt(result.match) >= 80 ? '#d1fae5' : 
                           parseInt(result.match) >= 60 ? '#fef3c7' : '#fee2e2'}; 
                           border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                <p>Your Resume Match Score:</p>
                <div style="font-size: 36px; font-weight: bold; color: ${
                  parseInt(result.match) >= 80 ? '#10b981' : 
                  parseInt(result.match) >= 60 ? '#f59e0b' : '#ef4444'
                };">${result.match}%</div>
              </div>
              
              <div style="text-align: center; margin: 20px 0; padding: 10px; background-color: ${parseInt(result.match) >= 60 ? '#d1fae5' : '#fee2e2'}; border-radius: 8px;">
                <p style="font-weight: bold; color: ${parseInt(result.match) >= 60 ? '#10b981' : '#ef4444'}; margin: 0; font-size: 18px;">
                  ${parseInt(result.match) >= 60 ? 
                    'Your resume has been selected and moving forward!' : 
                    'Unfortunately, you have not been shortlisted.'}
                </p>
              </div>
              
              <h3>Analysis Summary:</h3>
              <p>${result.summary}</p>
              ` : `
              <p>Your resume has been received and processed. To get a match score, please complete the job description analysis on our website.</p>
              `}
              
              <p>Our AI-powered system evaluates how well your qualifications align with the job requirements. A higher score indicates a stronger match.</p>
              
              <p>If your score is below 70%, consider the following tips:</p>
              <ul>
                <li>Customize your resume for each specific job application</li>
                <li>Include relevant keywords from the job description</li>
                <li>Highlight your achievements and quantifiable results</li>
                <li>Ensure your skills section matches the job requirements</li>
              </ul>
            </div>
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Resume Screener. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch(`${import.meta.env.VITE_NODEMAILER_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: extractedEmail,
          subject: 'Your Resume Match Results',
          message: emailTemplate
        }),
      });

      if (!emailResponse.ok) {
        throw new Error(`Error sending email: ${emailResponse.status}`);
      }

      const emailData = await emailResponse.json();
      
      if (emailData.success) {
        setEmailSuccess(`Email sent successfully to ${extractedEmail}`);
      } else {
        setEmailError(emailData.error || 'Failed to send email');
      }
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to extract and send email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMatchBg = (score: number) => {
    if (score >= 80) return 'bg-green-900/20 border-green-800';
    if (score >= 60) return 'bg-yellow-900/20 border-yellow-800';
    return 'bg-red-900/20 border-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-900 rounded-lg mb-4">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-100 mb-2">Resume Matcher</h1>
          <p className="text-gray-400">Upload a resume and job description to see how well they match</p>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-3">
                <FileText className="w-4 h-4 mr-2" />
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={8}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-3">
                <Upload className="w-4 h-4 mr-2" />
                Resume (PDF only)
              </label>
              
              <div className="border-2 border-dashed border-gray-700 rounded-md p-6 text-center">
                {resumeFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-300">{resumeFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-blue-400 hover:text-blue-300 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-900/20 border border-red-800 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Match'
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={extractAndSendEmail}
              disabled={isSendingEmail || !resumeFile}
              className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Mail
                </>
              )}
            </button>
            
            {emailSuccess && (
              <div className="mt-2 flex items-center p-3 bg-green-900/20 border border-green-800 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-green-400">{emailSuccess}</span>
              </div>
            )}
            
            {emailError && (
              <div className="mt-2 flex items-center p-3 bg-red-900/20 border border-red-800 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm text-red-400">{emailError}</span>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Match Results</h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-md border ${getMatchBg(parseInt(result.match))}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Match Score</span>
                    <span className={`text-2xl font-bold ${getMatchColor(parseInt(result.match))}`}>
                      {result.match}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        parseInt(result.match) >= 80 ? 'bg-green-500' :
                        parseInt(result.match) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.match}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Analysis Summary</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;