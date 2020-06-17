import {Component, OnInit} from '@angular/core';
import {Segment} from './objects/segment';
import {Letter} from './objects/letter';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  inputText = '';
  inputTextArray: string[];  // текст, подаваемый на вход
  textLength: number; //  — длина исходного текста;

  letters: Letter[]; //  — массив символов, составляющих алфавит исходного текста;
  lettersNumberDistinct: number; // — мощность алфавита исходного текста;

  code: number;
  dataSourceProbability;
  dataSourceSegment;

  displayedColumnsProbability: string[] = ['index', 'symbol', 'probability'];
  displayedColumnsSegment: string[] = ['left', 'right'];
  inputCode: number;
  decodedString: string;

  private defineSegments(letters: Letter[]) {
    const segments: Segment[] = [];
    let left = 0;
    for (let i = 0; i < this.lettersNumberDistinct; i++) {
      const segment = new Segment();
      segment.left = left;
      segment.right = left + letters[i].probability;
      segments.push(segment);
      left = segment.right;
    }
    this.dataSourceSegment = new MatTableDataSource(segments);
    return segments;
  }

  arithmeticCoding(letters: Letter[], inputTextArray: string[]): number {
    const segments: Segment[] = this.defineSegments(letters);

    let left = 0;
    let right = 1;

    for (let i = 0; i < this.textLength; i++) {
      const letter = inputTextArray[i];
      const indexOfLetter = this.letters.findIndex(ltr => ltr.symbol === letter);
      const newRight = left + (right - left) * segments[indexOfLetter].right;
      const newLeft = left + (right - left) * segments[indexOfLetter].left;
      left = newLeft;
      right = newRight;
    }
    return (left + right) / 2;
  }


  arithmeticDecoding(letters: Letter[], code: number): string {
    const segments: Segment[] = this.defineSegments2(letters);
    let s = '';

    for (let i = 0; i < this.textLength; i++) {
      for (let j = 0; j < this.lettersNumberDistinct; j++) {
        if (code >= segments[j].left && code < segments[j].right) {
          s = s + segments[j].character;
          code = (code - segments[j].left) / (segments[j].right - segments[j].left);
          break;
        }
      }
    }
    return s;
  }


  private defineSegments2(letters: Letter[]) {
    console.log('letters ', letters);
    const segments: Segment[] = [];
    let l = 0;
    for (let i = 0; i < this.lettersNumberDistinct; i++) {
      const segment = new Segment();
      segment.left = l;
      segment.right = l + letters[i].probability;
      segment.character = letters[i].symbol;
      segments.push(segment);
      l = segment.right;
    }
    return segments;
  }


  private defineAlphabet() {
    this.letters = [];
    const letters = Array.from(new Set(this.inputTextArray));
    for (const letter of letters) {
      this.letters.push(new Letter(letter));
    }

  }


  private defineProbability() {
    for (const letter of this.letters) {
      const quantityInArray = this.inputTextArray.filter(symb => symb === letter.symbol).length;
      letter.probability = quantityInArray / this.textLength;
    }

    this.letters.sort((a, b) => b.probability - a.probability);
    this.dataSourceProbability = new MatTableDataSource(this.letters);
    console.log('this.letters1', this.letters);
  }


  onSubmit() {
    if (this.inputText === '') {
      return;
    }
    this.decodedString = ''; // обнуляем
    this.code = null;
    this.inputCode = null;
    this.inputTextArray = this.inputText.split('');
    this.textLength = this.inputTextArray.length;

    this.defineAlphabet();
    this.lettersNumberDistinct = this.letters.length;

    this.defineProbability();

    const num = this.arithmeticCoding(this.letters, this.inputTextArray);
    this.code = num;
  }

  checkText($event: any) {
    const value = $event.target.value;
    if (value === '') {
      this.dataSourceProbability = null;
      this.dataSourceSegment = null;
    }
    if (value.length > 15) {
      this.inputText = value.substring(0, 15);
    }

  }

  onSubmitDecoder() {
    this.decodedString = this.arithmeticDecoding(this.letters, this.inputCode);
  }

  checkTextDecoder($event: any) {
/*    const value = $event.target.value;
    if (value === '') {
      this.dataSourceProbability = null;
      this.dataSourceSegment = null;
    }
    if (value.length > 15) {
      this.inputText = value.substring(0, 15);
    }*/
  }
}
