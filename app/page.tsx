"use client";
import { Textarea } from "@/components/ui/textarea";
import * as fal from "@fal-ai/serverless-client";
import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { extractColors } from "extract-colors";
import Image from "next/image";
import { SparklesCore } from "@/components/ui/sparkles";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export default function Page() {
  const [imageUrl, setImageUrl] = useState(null);
  const [val, setVal] = useDebounce(
    "beautiful flowers",
    300
  );
  const [bgColor, setBgColor] = useState("#fff");
  const [textColor, setTextColor] = useState("#000");

  const fetchImage = async () => {
    try {
      const result: any = await fal.subscribe("fal-ai/fast-turbo-diffusion", {
        input: {
          prompt: val,
          negative_prompt: "face, ugly, deformed",
        },
      });
      setImageUrl(result.images[0].url);
    } catch (error) {}
  };

  useEffect(() => {
    fetchImage();
  }, [val]);

  const getColorFromURL = async (url: string) => {
    try {
      const colors = await extractColors(url);
      return {
        bg: colors[colors.length - 1].hex ?? "#fff",
        text: colors[0].hex ?? "#000",
      };
    } catch (error) {
      console.error("Error getting color:", error);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      getColorFromURL(imageUrl).then((color) => {
        if (color) {
          setBgColor(color.bg as string);
          setTextColor(color.text as string);
        }
      });
    }
  }, [imageUrl]);

  return (
    <main
      style={{ backgroundColor: bgColor }}
      className="h-screen p-2 flex flex-col justify-center items-center"
    >
      <div>
        <h1
          className="md:text-7xl text-3xl lg:text-9xl font-bold text-center relative z-20"
          style={{ color: textColor }}
        >
          chróma
        </h1>
      </div>
      <div className="w-full absolute inset-0 z-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={1.2}
          maxSize={2.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor={textColor}
        />
      </div>
      <div className="z-10">
        {imageUrl ? (
          <div className="relative">
            <Image
              className="rounded-md"
              height={512}
              width={512}
              src={imageUrl}
              alt="Generated image"
            />
            <br />
            <Link href={imageUrl} className="absolute top-2 right-2" download="generated-image.jpg">
              <Button variant={"link"} size={"icon"}>
                <Download style={{color: bgColor}} size={18} />
              </Button>
            </Link>
          </div>
        ) : (
          <p>Loading image...</p>
        )}
        <br />
        <Textarea
          className="max-w-lg text-sm sm:text-lg placeholder:text-sm sm:placeholder:text-lg font-mono opacity-40"
          spellCheck={false}
          defaultValue={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Enter your prompt here"
        />
      </div>
      <div
        className="text-center text-base font-semibold absolute inset-x-0 bottom-4"
        style={{ color: textColor }}
      >
        <p>© 2024 Made by Dhruv.</p>
        <p>All Rights Reserved.</p>
      </div>
    </main>
  );
}
