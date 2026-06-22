import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") ?? "";
  const description = searchParams.get("description") ?? "";
  const icon = searchParams.get("icon");
  const type = searchParams.get("type") ?? "Plugin";

  const [font400, font700, font900] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/poppins-400.ttf")),
    readFile(join(process.cwd(), "public/fonts/poppins-700.ttf")),
    readFile(join(process.cwd(), "public/fonts/poppins-900.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        background: "#030712",
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "Poppins",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg, #4945FF 0%, #7b79ff 55%, transparent 100%)",
          display: "flex",
        }}
      />

      {/* Right glow */}
      <div
        style={{
          position: "absolute",
          right: -60,
          top: 0,
          width: 620,
          height: 630,
          background:
            "radial-gradient(ellipse at 55% 50%, rgba(73,69,255,0.22) 0%, rgba(73,69,255,0.07) 45%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Left: content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 0px 48px 80px",
          flex: 1,
          position: "relative",
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 600 600"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 208C0 109.948 0 60.9218 30.4609 30.4609C60.9218 0 109.948 0 208 0H392C490.052 0 539.078 0 569.539 30.4609C600 60.9218 600 109.948 600 208V392C600 490.052 600 539.078 569.539 569.539C539.078 600 490.052 600 392 600H208C109.948 600 60.9218 600 30.4609 569.539C0 539.078 0 490.052 0 392V208Z"
              fill="#4945FF"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M414 182H212V285H315V388H418V186C418 183.791 416.209 182 414 182Z"
              fill="white"
            />
            <rect x="311" y="285" width="4" height="4" fill="white" />
            <path
              d="M212 285H311C313.209 285 315 286.791 315 289V388H216C213.791 388 212 386.209 212 384V285Z"
              fill="#9593FF"
            />
            <path
              d="M315 388H418L318.414 487.586C317.154 488.846 315 487.953 315 486.172V388Z"
              fill="#9593FF"
            />
            <path
              d="M212 285H113.828C112.046 285 111.154 282.846 112.414 281.586L212 182V285Z"
              fill="#9593FF"
            />
          </svg>
          <span style={{ color: "#ffffff", fontSize: 28, fontWeight: 700 }}>
            Strapi Community
          </span>
        </div>

        {/* Badge + name + description */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                background: "#4945FF",
                color: "#ffffff",
                fontSize: 25,
                fontWeight: 900,
                letterSpacing: "0.1em",
                padding: "6px 16px",
                borderRadius: 100,
              }}
            >
              {type.toUpperCase()}
            </div>
          </div>
          <div
            style={{
              fontSize: name.length > 30 ? 52 : 64,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            {name}
          </div>
          {description && (
            <div
              style={{
                fontSize: 32,
                color: "#ffffff",
                lineHeight: 1.5,
                fontWeight: 400,
              }}
            >
              {description.length > 70
                ? `${description.slice(0, 70)}…`
                : description}
            </div>
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 28,
            fontWeight: 500,
          }}
        >
          community.strapi.io
        </div>
      </div>

      {/* Right: icon */}
      <div
        style={{
          paddingRight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          width: 440,
          flexShrink: 0,
        }}
      >
        {icon ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              padding: 10,
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={icon}
              width={180}
              height={180}
              alt=""
              style={{ objectFit: "contain" }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              background: "rgba(73,69,255,0.12)",
              borderRadius: 32,
              border: "1px solid rgba(123,121,255,0.2)",
            }}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 600 600"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 208C0 109.948 0 60.9218 30.4609 30.4609C60.9218 0 109.948 0 208 0H392C490.052 0 539.078 0 569.539 30.4609C600 60.9218 600 109.948 600 208V392C600 490.052 600 539.078 569.539 569.539C539.078 600 490.052 600 392 600H208C109.948 600 60.9218 600 30.4609 569.539C0 539.078 0 490.052 0 392V208Z"
                fill="#4945FF"
                fillOpacity="0.3"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M414 182H212V285H315V388H418V186C418 183.791 416.209 182 414 182Z"
                fill="white"
                fillOpacity="0.5"
              />
              <rect
                x="311"
                y="285"
                width="4"
                height="4"
                fill="white"
                fillOpacity="0.5"
              />
              <path
                d="M212 285H311C313.209 285 315 286.791 315 289V388H216C213.791 388 212 386.209 212 384V285Z"
                fill="#9593FF"
                fillOpacity="0.4"
              />
              <path
                d="M315 388H418L318.414 487.586C317.154 488.846 315 487.953 315 486.172V388Z"
                fill="#9593FF"
                fillOpacity="0.4"
              />
              <path
                d="M212 285H113.828C112.046 285 111.154 282.846 112.414 281.586L212 182V285Z"
                fill="#9593FF"
                fillOpacity="0.4"
              />
            </svg>
          </div>
        )}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Poppins", data: font400, weight: 400, style: "normal" },
        { name: "Poppins", data: font700, weight: 700, style: "normal" },
        { name: "Poppins", data: font900, weight: 900, style: "normal" },
      ],
    },
  );
}
