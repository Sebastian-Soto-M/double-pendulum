import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-chip',
  templateUrl: './info-chip.component.html',
  styleUrls: ['./info-chip.component.scss'],
})
export class InfoChipComponent implements OnInit {
  @Input() data = 0;
  @Input() label = '';

  constructor() {}

  ngOnInit(): void {}
}
