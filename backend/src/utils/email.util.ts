export class EmailUtil {
    private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    static validate(email: string): boolean {
        if (!email || email.length > 255) {
            return false;
        }
        return this.EMAIL_REGEX.test(email);
    }

    static normalize(email: string): string {
        return email.toLowerCase().trim();
    }

    static validateAndNormalize(email: string): {
        valid: boolean;
        normalized?: string;
        error?: string;
    } {
        const normalized = this.normalize(email);

        if (!this.validate(normalized)) {
            return {
                valid: false,
                error: 'Invalid email format'
            }
        }

        return {
            valid: true,
            normalized
        }
    }
}