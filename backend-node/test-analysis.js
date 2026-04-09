/**
 * Comprehensive Backend Testing & Analysis Script
 * Analyzes code quality, performance, and security
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analysis Results
const results = {
  timestamp: new Date().toISOString(),
  summary: {},
  codeQuality: {},
  performance: {},
  security: {},
  infrastructure: {},
  enterprise: {}
};

// ============================================
// 1. CODE QUALITY ANALYSIS
// ============================================

function analyzeCodeQuality() {
  console.log('\n📊 ANALYZING CODE QUALITY...\n');
  
  const codeQualityIssues = [];
  const fileStats = {
    totalFiles: 0,
    totalLines: 0,
    averageFileSize: 0,
    largeFiles: []
  };

  // Scan all JS files
  const scanDir = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        if (file.startsWith('.') || file === 'node_modules' || file === 'tests' || file === 'analysis_output.txt') return;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.js')) {
          fileStats.totalFiles++;
          
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n').length;
          fileStats.totalLines += lines;
          
          // Check for large files (>300 lines)
          if (lines > 300) {
            fileStats.largeFiles.push({
              file: filePath.replace(__dirname, ''),
              lines: lines
            });
          }
          
          // Check for code quality issues
          if (content.includes('TODO') || content.includes('FIXME')) {
            const matches = content.match(/TODO|FIXME/g);
            codeQualityIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'TODO/FIXME comments',
              count: matches.length
            });
          }
          
          // Check for console.log (should use logger)
          if (content.includes('console.log') && !content.includes('logger')) {
            codeQualityIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'console.log usage',
              severity: 'medium'
            });
          }
          
          // Check for try-catch without proper logging
          const tryCatchMatches = content.match(/try\s*{/g) || [];
          const logMatches = content.match(/logger\.(error|warn)/g) || [];
          if (tryCatchMatches.length > logMatches.length) {
            codeQualityIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Incomplete error handling',
              tryCatchBlocks: tryCatchMatches.length,
              logStatements: logMatches.length
            });
          }
        }
      });
    } catch (e) {
      console.error('Error scanning directory:', e.message);
    }
  };

  scanDir(__dirname);
  
  if (fileStats.totalFiles > 0) {
    fileStats.averageFileSize = Math.round(fileStats.totalLines / fileStats.totalFiles);
  }

  results.codeQuality = {
    fileStats,
    issues: codeQualityIssues,
    summary: {
      totalFiles: fileStats.totalFiles,
      totalLines: fileStats.totalLines,
      averageFileSize: fileStats.averageFileSize,
      issuesFound: codeQualityIssues.length,
      largeFiles: fileStats.largeFiles.length
    }
  };

  console.log('✅ Code Quality Analysis Complete');
  console.log(`   Total Files: ${fileStats.totalFiles}`);
  console.log(`   Total Lines: ${fileStats.totalLines}`);
  console.log(`   Average File Size: ${fileStats.averageFileSize} lines`);
  console.log(`   Issues Found: ${codeQualityIssues.length}`);
  console.log(`   Large Files (>300 lines): ${fileStats.largeFiles.length}`);
}

// ============================================
// 2. SECURITY ANALYSIS
// ============================================

function analyzeSecurityIssues() {
  console.log('\n🔐 ANALYZING SECURITY...\n');
  
  const securityIssues = [];
  const securityChecks = {
    hardcodedSecrets: 0,
    sqlInjectionRisks: 0,
    xssRisks: 0,
    corsIssues: 0,
    authenticationGaps: 0
  };

  const scanDir = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        if (file.startsWith('.') || file === 'node_modules' || file === 'tests' || file === 'analysis_output.txt') return;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.js')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Check for hardcoded secrets
          if (/password\s*[:=]\s*['"][^'"]*['"]/.test(content) ||
              /apikey\s*[:=]\s*['"][^'"]*['"]/.test(content) ||
              /secret\s*[:=]\s*['"][^'"]*['"]/.test(content)) {
            securityChecks.hardcodedSecrets++;
            securityIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Hardcoded secrets detected',
              severity: 'critical'
            });
          }
          
          // Check for SQL injection risks
          if (/query\s*\(\s*`.*\$\{/.test(content)) {
            securityChecks.sqlInjectionRisks++;
            securityIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Potential SQL injection',
              severity: 'high'
            });
          }
          
          // Check for missing input validation
          if (/req\.body\.[a-zA-Z]+(?!.*validate|.*sanitize|.*check)/.test(content)) {
            securityIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Missing input validation',
              severity: 'medium'
            });
          }
          
          // Check for unencrypted sensitive data
          if (/password|token|secret|apikey/.test(content) && !content.includes('encrypt')) {
            securityIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Unencrypted sensitive data',
              severity: 'high'
            });
          }
        }
      });
    } catch (e) {
      console.error('Error scanning directory:', e.message);
    }
  };

  scanDir(__dirname);

  results.security = {
    checks: securityChecks,
    issues: securityIssues,
    summary: {
      totalIssues: securityIssues.length,
      criticalIssues: securityIssues.filter(i => i.severity === 'critical').length,
      highIssues: securityIssues.filter(i => i.severity === 'high').length,
      mediumIssues: securityIssues.filter(i => i.severity === 'medium').length
    }
  };

  console.log('✅ Security Analysis Complete');
  console.log(`   Total Issues: ${securityIssues.length}`);
  console.log(`   Critical: ${securityIssues.filter(i => i.severity === 'critical').length}`);
  console.log(`   High: ${securityIssues.filter(i => i.severity === 'high').length}`);
  console.log(`   Medium: ${securityIssues.filter(i => i.severity === 'medium').length}`);
}

// ============================================
// 3. PERFORMANCE ANALYSIS
// ============================================

function analyzePerformanceIssues() {
  console.log('\n⚡ ANALYZING PERFORMANCE...\n');
  
  const performanceIssues = [];
  const performanceChecks = {
    missingCaching: 0,
    inefficientQueries: 0,
    missingIndexes: 0,
    largePayloads: 0
  };

  const scanDir = (dir) => {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        if (file.startsWith('.') || file === 'node_modules' || file === 'tests' || file === 'analysis_output.txt') return;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.js')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Check for missing caching
          if (/find\(|findOne\(|query\(/.test(content) && !content.includes('cache') && !content.includes('redis')) {
            performanceChecks.missingCaching++;
            performanceIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Missing caching strategy',
              severity: 'medium'
            });
          }
          
          // Check for inefficient queries
          if (/find\(\)\s*\.exec\(\)/.test(content)) {
            performanceIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Inefficient query pattern',
              severity: 'low'
            });
          }
          
          // Check for missing pagination
          if (/find\(\)/.test(content) && !content.includes('limit') && !content.includes('skip')) {
            performanceIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Missing pagination',
              severity: 'medium'
            });
          }
          
          // Check for large JSON responses
          if (/res\.json\(/.test(content) && !content.includes('select')) {
            performanceIssues.push({
              file: filePath.replace(__dirname, ''),
              type: 'Potential large response payload',
              severity: 'low'
            });
          }
        }
      });
    } catch (e) {
      console.error('Error scanning directory:', e.message);
    }
  };

  scanDir(__dirname);

  results.performance = {
    checks: performanceChecks,
    issues: performanceIssues,
    summary: {
      totalIssues: performanceIssues.length,
      criticalIssues: performanceIssues.filter(i => i.severity === 'critical').length,
      highIssues: performanceIssues.filter(i => i.severity === 'high').length,
      mediumIssues: performanceIssues.filter(i => i.severity === 'medium').length
    }
  };

  console.log('✅ Performance Analysis Complete');
  console.log(`   Total Issues: ${performanceIssues.length}`);
  console.log(`   Critical: ${performanceIssues.filter(i => i.severity === 'critical').length}`);
  console.log(`   High: ${performanceIssues.filter(i => i.severity === 'high').length}`);
  console.log(`   Medium: ${performanceIssues.filter(i => i.severity === 'medium').length}`);
}

// ============================================
// 4. INFRASTRUCTURE ANALYSIS
// ============================================

function analyzeInfrastructure() {
  console.log('\n🏗️  ANALYZING INFRASTRUCTURE...\n');
  
  const infrastructureIssues = [];
  
  // Check database configuration
  const dbConfigPath = path.join(__dirname, 'config', 'database.js');
  if (fs.existsSync(dbConfigPath)) {
    const dbContent = fs.readFileSync(dbConfigPath, 'utf-8');
    
    if (!dbContent.includes('connection pooling') && !dbContent.includes('maxPoolSize')) {
      infrastructureIssues.push({
        component: 'Database',
        issue: 'No connection pooling configured',
        severity: 'high',
        recommendation: 'Add connection pool configuration'
      });
    }
    
    if (!dbContent.includes('retry') && !dbContent.includes('reconnect')) {
      infrastructureIssues.push({
        component: 'Database',
        issue: 'No retry logic for failed connections',
        severity: 'medium',
        recommendation: 'Add automatic retry mechanism'
      });
    }
  }
  
  // Check for caching layer
  const hasRedis = fs.readdirSync(__dirname).some(f => {
    const fPath = path.join(__dirname, f);
    try {
      return fs.statSync(fPath).isFile() && fs.readFileSync(fPath, 'utf-8').includes('redis');
    } catch (e) {
      return false;
    }
  });
  
  if (!hasRedis) {
    infrastructureIssues.push({
      component: 'Caching',
      issue: 'No Redis caching layer',
      severity: 'high',
      recommendation: 'Implement Redis for caching'
    });
  }
  
  // Check for monitoring
  const hasMonitoring = fs.readdirSync(__dirname).some(f => {
    const fPath = path.join(__dirname, f);
    try {
      if (!fs.statSync(fPath).isFile()) return false;
      const content = fs.readFileSync(fPath, 'utf-8');
      return content.includes('prometheus') || content.includes('metrics');
    } catch (e) {
      return false;
    }
  });
  
  if (!hasMonitoring) {
    infrastructureIssues.push({
      component: 'Monitoring',
      issue: 'No metrics/monitoring infrastructure',
      severity: 'medium',
      recommendation: 'Add Prometheus metrics'
    });
  }

  results.infrastructure = {
    issues: infrastructureIssues,
    summary: {
      totalIssues: infrastructureIssues.length,
      criticalIssues: infrastructureIssues.filter(i => i.severity === 'critical').length,
      highIssues: infrastructureIssues.filter(i => i.severity === 'high').length,
      mediumIssues: infrastructureIssues.filter(i => i.severity === 'medium').length
    }
  };

  console.log('✅ Infrastructure Analysis Complete');
  console.log(`   Total Issues: ${infrastructureIssues.length}`);
  console.log(`   Critical: ${infrastructureIssues.filter(i => i.severity === 'critical').length}`);
  console.log(`   High: ${infrastructureIssues.filter(i => i.severity === 'high').length}`);
  console.log(`   Medium: ${infrastructureIssues.filter(i => i.severity === 'medium').length}`);
}

// ============================================
// 5. ENTERPRISE FEATURES ANALYSIS
// ============================================

function analyzeEnterpriseFeatures() {
  console.log('\n🏢 ANALYZING ENTERPRISE FEATURES...\n');
  
  const missingFeatures = [];
  
  const features = [
    { name: 'API Versioning', file: 'server.js', pattern: '/v1/|/v2/' },
    { name: 'Rate Limiting', file: 'middleware', pattern: 'rateLimit|rate-limit' },
    { name: 'Request Logging', file: 'middleware', pattern: 'requestLogger|request-logger' },
    { name: 'Audit Trail', file: 'middleware', pattern: 'audit|auditLog' },
    { name: 'Multi-tenancy', file: 'models', pattern: 'tenantId|tenant_id' },
    { name: 'OAuth2', file: 'middleware', pattern: 'oauth|OAuth' },
    { name: 'Encryption', file: 'utils', pattern: 'encrypt|crypto' },
    { name: 'GraphQL', file: 'server.js', pattern: 'graphql|GraphQL' },
    { name: 'Request Validation', file: 'middleware', pattern: 'joi|validator|yup' },
    { name: 'CORS Configuration', file: 'server.js', pattern: 'cors' }
  ];

  features.forEach(feature => {
    let found = false;
    
    try {
      const scanPath = path.join(__dirname, feature.file);
      if (fs.statSync(scanPath).isDirectory()) {
        const files = fs.readdirSync(scanPath);
        files.forEach(file => {
          const content = fs.readFileSync(path.join(scanPath, file), 'utf-8');
          if (new RegExp(feature.pattern, 'i').test(content)) {
            found = true;
          }
        });
      } else {
        const content = fs.readFileSync(scanPath, 'utf-8');
        if (new RegExp(feature.pattern, 'i').test(content)) {
          found = true;
        }
      }
    } catch (e) {
      // File not found
    }
    
    if (!found) {
      missingFeatures.push({
        feature: feature.name,
        status: 'Not Implemented',
        priority: 'medium'
      });
    }
  });

  results.enterprise = {
    missingFeatures,
    summary: {
      totalFeatures: features.length,
      implementedFeatures: features.length - missingFeatures.length,
      missingFeatures: missingFeatures.length,
      completeness: Math.round(((features.length - missingFeatures.length) / features.length) * 100)
    }
  };

  console.log('✅ Enterprise Features Analysis Complete');
  console.log(`   Total Features: ${features.length}`);
  console.log(`   Implemented: ${features.length - missingFeatures.length}`);
  console.log(`   Missing: ${missingFeatures.length}`);
  console.log(`   Completeness: ${Math.round(((features.length - missingFeatures.length) / features.length) * 100)}%`);
}

// ============================================
// 6. GENERATE REPORT
// ============================================

function generateReport() {
  console.log('\n\n📋 GENERATING COMPREHENSIVE REPORT...\n');
  
  const reportPath = path.join(__dirname, 'BACKEND_ANALYSIS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`✅ Report saved to: ${reportPath}`);
  
  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('BACKEND ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n📊 CODE QUALITY');
  console.log(`   Files: ${results.codeQuality.summary.totalFiles}`);
  console.log(`   Lines: ${results.codeQuality.summary.totalLines}`);
  console.log(`   Issues: ${results.codeQuality.summary.issuesFound}`);
  
  console.log('\n🔐 SECURITY');
  console.log(`   Critical: ${results.security.summary.criticalIssues}`);
  console.log(`   High: ${results.security.summary.highIssues}`);
  console.log(`   Medium: ${results.security.summary.mediumIssues}`);
  
  console.log('\n⚡ PERFORMANCE');
  console.log(`   Critical: ${results.performance.summary.criticalIssues}`);
  console.log(`   High: ${results.performance.summary.highIssues}`);
  console.log(`   Medium: ${results.performance.summary.mediumIssues}`);
  
  console.log('\n🏗️  INFRASTRUCTURE');
  console.log(`   Critical: ${results.infrastructure.summary.criticalIssues}`);
  console.log(`   High: ${results.infrastructure.summary.highIssues}`);
  console.log(`   Medium: ${results.infrastructure.summary.mediumIssues}`);
  
  console.log('\n🏢 ENTERPRISE');
  console.log(`   Completeness: ${results.enterprise.summary.completeness}%`);
  console.log(`   Implemented: ${results.enterprise.summary.implementedFeatures}/${results.enterprise.summary.totalFeatures}`);
  
  console.log('\n' + '='.repeat(60));
}

// ============================================
// MAIN EXECUTION
// ============================================

console.log('🚀 STARTING COMPREHENSIVE BACKEND ANALYSIS...\n');

analyzeCodeQuality();
analyzeSecurityIssues();
analyzePerformanceIssues();
analyzeInfrastructure();
analyzeEnterpriseFeatures();
generateReport();

console.log('\n✅ ANALYSIS COMPLETE!\n');
