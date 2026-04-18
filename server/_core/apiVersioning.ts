/**
 * API Versioning Utilities
 * Provides helpers for managing multiple API versions
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiVersion {
  version: string;
  releaseDate: Date;
  deprecated: boolean;
  deprecationDate?: Date;
  supportEndDate?: Date;
}

export const API_VERSIONS: Record<string, ApiVersion> = {
  'v1': {
    version: 'v1',
    releaseDate: new Date('2024-01-01'),
    deprecated: false,
  },
  'v2': {
    version: 'v2',
    releaseDate: new Date('2024-06-01'),
    deprecated: false,
  },
};

/**
 * Extract API version from request
 */
export const getApiVersion = (req: Request): string => {
  // Check URL path: /api/v1/users or /api/v2/users
  const pathMatch = req.path.match(/\/api\/(v\d+)\//);
  if (pathMatch) {
    return pathMatch[1];
  }

  // Check Accept header: application/vnd.api+json;version=2
  const acceptHeader = req.get('Accept') || '';
  const versionMatch = acceptHeader.match(/version=(\d+)/);
  if (versionMatch) {
    return `v${versionMatch[1]}`;
  }

  // Check X-API-Version header
  const customHeader = req.get('X-API-Version');
  if (customHeader) {
    return customHeader;
  }

  // Default to latest version
  return 'v2';
};

/**
 * Middleware to add API version to request
 */
export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  (req as any).apiVersion = getApiVersion(req);
  res.set('API-Version', (req as any).apiVersion);
  next();
};

/**
 * Check if version is deprecated
 */
export const isVersionDeprecated = (version: string): boolean => {
  const versionInfo = API_VERSIONS[version];
  return versionInfo?.deprecated || false;
};

/**
 * Get deprecation warning
 */
export const getDeprecationWarning = (version: string): string | null => {
  const versionInfo = API_VERSIONS[version];

  if (!versionInfo?.deprecated) {
    return null;
  }

  let warning = `API version ${version} is deprecated`;

  if (versionInfo.supportEndDate) {
    const daysUntilEnd = Math.ceil(
      (versionInfo.supportEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    warning += ` and will be removed in ${daysUntilEnd} days`;
  }

  warning += '. Please migrate to the latest version.';
  return warning;
};

/**
 * Transform response based on API version
 */
export const transformResponse = (
  data: any,
  version: string
): any => {
  switch (version) {
    case 'v1':
      // v1 format: flat structure
      return {
        data,
        status: 'success',
      };

    case 'v2':
      // v2 format: enhanced structure with metadata
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        version: 'v2',
      };

    default:
      return data;
  }
};

/**
 * Transform request based on API version
 */
export const transformRequest = (
  body: any,
  version: string
): any => {
  switch (version) {
    case 'v1':
      // v1 might have different field names
      return body;

    case 'v2':
      // v2 has standardized field names
      return body;

    default:
      return body;
  }
};

/**
 * Version compatibility checker
 */
export const checkVersionCompatibility = (
  requestVersion: string,
  supportedVersions: string[]
): { compatible: boolean; message: string } => {
  if (supportedVersions.includes(requestVersion)) {
    return {
      compatible: true,
      message: `API version ${requestVersion} is supported`,
    };
  }

  return {
    compatible: false,
    message: `API version ${requestVersion} is not supported. Supported versions: ${supportedVersions.join(', ')}`,
  };
};

/**
 * Get latest API version
 */
export const getLatestVersion = (): string => {
  const versions = Object.keys(API_VERSIONS).sort().reverse();
  return versions[0] || 'v1';
};

/**
 * Get all active API versions
 */
export const getActiveVersions = (): string[] => {
  return Object.keys(API_VERSIONS).filter((v) => !API_VERSIONS[v].deprecated);
};

/**
 * Middleware to enforce minimum API version
 */
export const enforceMinimumVersion = (minimumVersion: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const version = getApiVersion(req);
    const versionNumber = parseInt(version.replace('v', ''));
    const minimumNumber = parseInt(minimumVersion.replace('v', ''));

    if (versionNumber < minimumNumber) {
      res.status(400).json({
        success: false,
        error: `API version ${version} is no longer supported. Minimum version: ${minimumVersion}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to add deprecation warning header
 */
export const addDeprecationWarning = (req: Request, res: Response, next: NextFunction): void => {
  const version = getApiVersion(req);
  const warning = getDeprecationWarning(version);

  if (warning) {
    res.set('Deprecation', 'true');
    res.set('Sunset', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString());
    res.set('Warning', `299 - "${warning}"`);
  }

  next();
};

export default {
  getApiVersion,
  apiVersionMiddleware,
  isVersionDeprecated,
  getDeprecationWarning,
  transformResponse,
  transformRequest,
  checkVersionCompatibility,
  getLatestVersion,
  getActiveVersions,
  enforceMinimumVersion,
  addDeprecationWarning,
  API_VERSIONS,
};
