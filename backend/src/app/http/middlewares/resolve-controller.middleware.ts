import { RequestHandler } from 'express';

export function resolveController(name: string): RequestHandler {
    return (req: any, res, next) => {
        // console.log(`[resolveController] resolving ${name}`);
        const scope = req.container;
        if (!scope) {
            return res.status(500).json({ message: 'DI scope not found on request' });
        }
        try {
            // Resolve the actual instance (not the cradle proxy) to preserve `this`
            const ctrl = scope.resolve(name);
            if (!ctrl) {
                return res.status(500).json({ message: `Controller "${name}" not found` });
            }
            (req as any)[name] = ctrl;
            return next();
        } catch (err) {
            console.error(`[resolveController] failed to resolve ${name}`, err);
            return res.status(500).json({ message: `Failed to resolve controller "${name}"`, error: String(err) });
        }
    };
}