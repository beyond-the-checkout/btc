import { getQRData, QRCodeSVG, DotsOptions, EyeOptions, FrameOptions } from "@/lib/qr";
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
    qrShape,
    dotsOptions,
    eyeOptions,
    frameOptions,
  }: {
    url: string;
    fgColor?: string;
    hideLogo?: boolean;
    logo?: string;
    scale?: number;
    margin?: number;
    qrShape?: "square" | "circle";
    dotsOptions?: DotsOptions;
    eyeOptions?: EyeOptions;
    frameOptions?: FrameOptions;
  }) => {
    const qrData = useMemo(
      () => getQRData({ url, fgColor, hideLogo, logo, margin, qrShape, dotsOptions, eyeOptions, frameOptions }),
      [url, fgColor, hideLogo, logo, margin, qrShape, dotsOptions, eyeOptions, frameOptions],
    );

    return (
      <QRCodeSVG
        value={qrData.value}
        size={(qrData.size / 8) * scale}
        bgColor={qrData.bgColor}
        fgColor={qrData.fgColor}
        level={qrData.level}
        margin={qrData.margin}
        qrShape={qrData.qrShape}
        dotsOptions={qrData.dotsOptions}
        eyeOptions={qrData.eyeOptions}
        frameOptions={qrData.frameOptions}
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
