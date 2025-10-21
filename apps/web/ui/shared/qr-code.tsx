import { getQRData, QRCodeSVG, DotsOptions, EyeOptions } from "@/lib/qr";
import { DEFAULT_MARGIN } from "@/lib/qr/constants";
import { memo, useMemo } from "react";

export const QRCode = memo(
  ({
    url,
    fgColor,
    hideLogo,
    logo,
    scale = 1,
    margin = DEFAULT_MARGIN,
    dotsOptions,
    eyeOptions,
  }: {
    url: string;
    fgColor?: string;
    hideLogo?: boolean;
    logo?: string;
    scale?: number;
    margin?: number;
    dotsOptions?: DotsOptions;
    eyeOptions?: EyeOptions;
  }) => {
    const qrData = useMemo(
      () => getQRData({ url, fgColor, hideLogo, logo, margin, dotsOptions, eyeOptions }),
      [url, fgColor, hideLogo, logo, margin, dotsOptions, eyeOptions],
    );

    return (
      <QRCodeSVG
        value={qrData.value}
        size={(qrData.size / 8) * scale}
        bgColor={qrData.bgColor}
        fgColor={qrData.fgColor}
        level={qrData.level}
        margin={qrData.margin}
        dotsOptions={qrData.dotsOptions}
        eyeOptions={qrData.eyeOptions}
        {...(qrData.imageSettings && {
          imageSettings: {
            ...qrData.imageSettings,
            height: qrData.imageSettings
              ? (qrData.imageSettings.height / 8) * scale
              : 0,
            width: qrData.imageSettings
              ? (qrData.imageSettings.width / 8) * scale
              : 0,
          },
        })}
      />
    );
  },
);

QRCode.displayName = "QRCode";
