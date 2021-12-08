import {
  AfterViewInit,
  OnDestroy,
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

import * as p5 from 'p5';

const CANVAS_DIM = 400;
const PI = 3.14;
const GRAVITY = CANVAS_DIM * 0.000981;
const SEE_TRAIL = true;
const SEE_LINE1 = false;
const AIR_RESSISTANCE = 0.998888;

@Component({
  selector: 'app-double-pendulum',
  templateUrl: './double-pendulum.component.html',
  styleUrls: ['./double-pendulum.component.scss'],
})
export class DoublePendulumComponent implements OnInit {
  @Input() title = 'Title';
  @Input() canvas_id = 'id';
  @Input() angle1: number = 9;
  @Input() angle2: number = PI;
  @ViewChild('canvas_parent')
  canvasParent!: ElementRef<HTMLDivElement>;

  acceleration1 = 0;
  acceleration2 = 0;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;

  options: FormGroup;
  angleBall1Control = new FormControl(this.angle1);
  angleBall2Control = new FormControl(this.angle2);

  constructor(fb: FormBuilder) {
    this.options = fb.group({
      angleBall1: this.angleBall1Control,
      angleBall2: this.angleBall2Control,
    });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    let element = <HTMLElement>document.getElementById('defaultCanvas0');
    if (element != null) element.remove();
    const sketch = this.newSketch(
      this.angleBall1Control.value,
      this.angleBall2Control.value
    );
    let canvas = new p5(sketch);
  }

  newSketch(angle1: number, angle2: number) {
    let buffer: p5.Graphics;
    let cx: number, cy: number;
    const textSize = 16;
    return (s: p5) => {
      let p1 = new Pendulum(s, 0, angle1);
      let p2 = new Pendulum(s, 0, angle2);
      s.preload = () => {
        // preload code
      };

      s.setup = () => {
        let cnv = s.createCanvas(CANVAS_DIM, CANVAS_DIM);
        s.pixelDensity(1);
        cnv.parent(this.canvas_id);
        cx = s.width / 2;
        cy = s.height / 2;
        buffer = s.createGraphics(s.width, s.height);
        buffer.background(66);
        buffer.translate(cx, cy);
      };

      s.draw = () => {
        // s.background(66);
        s.imageMode(s.CORNER);
        s.image(buffer, 0, 0, s.width, s.height);
        s.translate(cx, cy);
        s.stroke(54);
        s.strokeWeight(5);
        s.noFill();
        s.circle(0, 0, s.width * 0.85);

        s.noStroke();
        s.fill(195);
        s.textSize(textSize);
        s.text('π', -textSize / 4, -s.height / 2 + textSize * 1.8);
        s.text('0', -textSize / 4, s.height / 2 - textSize);
        s.text('-π/2', -s.width / 2 - textSize / 7, 0);
        s.text('π/2', s.width / 2 - textSize * 1.7, 0);

        p1.x = p1.line_length * Math.sin(p1.angle);
        p1.y = p1.line_length * Math.cos(p1.angle);
        p2.x = p1.x + p2.line_length * Math.sin(p2.angle);
        p2.y = p1.y + p2.line_length * Math.cos(p2.angle);

        p2.drawLine(p1.x, p1.y, 255, 255, 255);
        p2.draw(
          p2.x,
          p2.y,
          (255 / s.width) * p2.angle + p2.y,
          p2.x,
          (255 / s.width) * p1.angle - p2.y
        );
        p1.drawLine(0, 0, 255, 255, 255);
        p1.draw(
          0,
          0,
          (255 / s.width) * p2.angle - p1.y,
          p1.x,
          (255 / s.width) * p1.angle + p1.y
        );

        let [a1, a2] = Pendulum.doublePendulumAcceleration(p1, p2);
        p1.updateMovement(a1);
        p2.updateMovement(a2);

        buffer.stroke(0);
        if (s.frameCount > 1) {
          // p1.drawPath(buffer, {
          //   b: (255 / width) * p1.angle + p1.y,
          //   g: p1.x,
          //   r: (255 / width) * p2.angle - p1.y,
          // });
          p2.drawPath(buffer, {
            r: (255 / s.width) * p1.angle + p2.y,
            g: p2.x,
            b: (255 / s.width) * p2.angle - p2.y,
          });
        }
        p1.px = p1.x;
        p1.py = p1.y;
        p2.px = p2.x;
        p2.py = p2.y;
        this.acceleration1 = a1 * 5000;
        this.acceleration2 = a2 * 5000;
        this.x1 = p1.px;
        this.y1 = p1.py;
        this.x2 = p2.px;
        this.y2 = p2.py;
      };
    };
  }

  saveImage() {
    let canvas_parent = <HTMLElement>document.getElementById(this.canvas_id);
    let canvas = <HTMLCanvasElement>canvas_parent.children[0];
    let dataURL = canvas.toDataURL('image/png');
    var link = document.createElement('a');
    link.download = 'pendulum.png';
    link.href = dataURL;
    link.click();
  }
}
class Pendulum {
  sketch: p5;
  velocity: number;
  angle: number;
  mass: number;
  line_length: number;
  x: number;
  y: number;
  px: number;
  py: number;
  constructor(
    sketch: p5,
    velocity: number,
    angle: number,
    { mass = CANVAS_DIM * 0.05, line_length = CANVAS_DIM / 5 } = {}
  ) {
    this.sketch = sketch;
    this.velocity = velocity;
    this.angle = angle;
    this.x = 0;
    this.y = 0;
    this.px = 0;
    this.py = 0;
    this.mass = mass;
    this.line_length = line_length;
  }

  updateMovement(acceleration: number) {
    this.velocity += acceleration;
    this.angle += this.velocity;
    this.velocity *= AIR_RESSISTANCE;
  }

  draw(originX: number, originY: number, r: number, g: number, b: number) {
    this.sketch.line(originX, originY, this.x, this.y);
    this.sketch.fill(r, g, b);
    this.sketch.ellipse(this.x, this.y, this.mass, this.mass);
  }

  drawLine(originX: number, originY: number, r: number, g: number, b: number) {
    this.sketch.stroke(r, g, b);
    this.sketch.strokeWeight(this.mass * 0.09);
    this.sketch.line(originX, originY, this.x, this.y);
  }

  drawPath(
    buffer: p5.Graphics,
    {
      r = (255 / this.sketch.width) * this.angle - this.y,
      g = this.x,
      b = (255 / this.sketch.width) * this.angle + this.y,
    } = {}
  ) {
    buffer.stroke(r, g, b);
    buffer.strokeWeight(2);
    buffer.line(this.px, this.py, this.x, this.y);
  }

  static doublePendulumAcceleration(p1: Pendulum, p2: Pendulum) {
    // equations of motion for the double pendulum:
    // https://www.myphysicslab.com/pendulum/double-pendulum-en.html
    let num1 = -GRAVITY * (2 * p1.mass + p2.mass) * Math.sin(p1.angle);
    let num2 = -p2.mass * GRAVITY * Math.sin(p1.angle - 2 * p2.angle);
    let num3 = -2 * Math.sin(p1.angle - p2.angle) * p2.mass;
    let num4 =
      p2.velocity * p2.velocity * p2.line_length +
      p1.velocity *
        p1.velocity *
        p1.line_length *
        Math.cos(p1.angle - p2.angle);
    let den =
      p1.line_length *
      (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.angle - 2 * p2.angle));
    let p1_acceleration = (num1 + num2 + num3 * num4) / den;

    num1 = 2 * Math.sin(p1.angle - p2.angle);
    num2 = p1.velocity * p1.velocity * p1.line_length * (p1.mass + p2.mass);
    num3 = GRAVITY * (p1.mass + p2.mass) * Math.cos(p1.angle);
    num4 =
      p2.velocity *
      p2.velocity *
      p2.line_length *
      p2.mass *
      Math.cos(p1.angle - p2.angle);
    den =
      p2.line_length *
      (2 * p1.mass + p2.mass - p2.mass * Math.cos(2 * p1.angle - 2 * p2.angle));
    let p2_acceleration = (num1 * (num2 + num3 + num4)) / den;
    return [p1_acceleration, p2_acceleration];
  }
}
