import { Injectable, ElementRef } from '@angular/core';

import * as p5 from 'p5';

@Injectable()
export class NoiseService {
  private setBackground = (s: p5) => s.background(51);
  private setFill = (s: p5) => s.fill(2, 165, 255);
  private setStroke = (s: p5) => s.stroke(2, 165, 255);

  noise2d = (element: ElementRef, width: number, height: number): p5 => {
    let inc = 0.01;

    return new p5((s: p5) => {
      s.setup = () => {
        s.createCanvas(width, height);
        s.noiseSeed(s.random(0, 255));
        s.pixelDensity(1);
      };

      s.draw = () => {
        let yoff = 0;
        s.loadPixels();

        for (let y = 0; y < s.height; y++) {
          let xoff = 0;

          for (let x = 0; x < s.width; x++) {
            let index = (x + y * s.width) * 4;

            let r = s.noise(xoff, yoff) * 255;

            s.pixels[index + 0] = r;
            s.pixels[index + 1] = r;
            s.pixels[index + 2] = r;
            s.pixels[index + 3] = 255;

            xoff += inc;
          }

          yoff += inc;
        }

        s.updatePixels();
      };
    }, element.nativeElement);
  };
}
