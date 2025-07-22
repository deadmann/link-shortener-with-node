import type {Request, Response, NextFunction} from 'express';

export const validateUrl = (req: Request, res: Response, next: NextFunction) => {
    const { originalUrl, customCode } = req.body;

    // Check if URL is provided
    if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate URL format
    try {
        new URL(originalUrl);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Validate custom code if provided
    if (customCode) {
        const codeRegex = /^[A-Za-z0-9_-]+$/;
        if (!codeRegex.test(customCode)) {
            return res.status(400).json({
                error: 'Custom code can only contain letters, numbers, hyphens, and underscores'
            });
        }

        if (customCode.length > 20) {
            return res.status(400).json({
                error: 'Custom code must be 20 characters or less'
            });
        }
    }

    next();
};