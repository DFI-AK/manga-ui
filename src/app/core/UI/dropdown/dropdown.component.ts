import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input()
  public title: string = "";

  @ViewChild('dropdownRef') dropDownRef!: ElementRef<HTMLDetailsElement>;

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.dropDownRef && event.target instanceof Node && !this.dropDownRef.nativeElement.contains(event.target)) {
      this.dropDownRef.nativeElement.removeAttribute('open');
    }
  }

  @Input()
  clickHandler = () => { };

  closeDropdown(title: string) {
    this.title = title;
    this.dropDownRef.nativeElement.removeAttribute('open');
  }
}
