import QRCode from 'qrcode';

interface QrOptions {
    width: number;
}

// Function to generate a styled QR code with a logo in the center
export const createStyledQrCode = (data: string, options: QrOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H', // High correction level to allow for logo overlay
            width: options.width,
            margin: 1,
            color: {
                dark: '#3a2a1a', // Dark brown for the QR code
                light: '#f5e8d500' // Transparent background
            }
        }, (err, url) => {
            if (err) return reject(err);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Could not get canvas context');

            const qrImage = new Image();
            qrImage.crossOrigin = "Anonymous";
            qrImage.onload = () => {
                canvas.width = qrImage.width;
                canvas.height = qrImage.height;
                ctx.drawImage(qrImage, 0, 0);

                const logoImage = new Image();
                logoImage.crossOrigin = "Anonymous";
                logoImage.onload = () => {
                    const logoSize = canvas.width * 0.25; // Logo occupies 25% of the QR code width
                    const x = (canvas.width - logoSize) / 2;
                    const y = (canvas.height - logoSize) / 2;
                    // Draw a background for the logo
                    ctx.fillStyle = '#f5e8d5'; // Parchment background for the logo
                    ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
                    ctx.drawImage(logoImage, x, y, logoSize, logoSize);
                    resolve(canvas.toDataURL('image/png'));
                };
                logoImage.src = 'https://i.imgur.com/U1uBq07.png'; // Monogram logo
            };
            qrImage.src = url;
        });
    });
};
