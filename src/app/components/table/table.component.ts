import { Component, OnInit } from '@angular/core';
import { PeriodicElement } from '../../models/periodic-element.model';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { Subject } from 'rxjs';
import { RxState } from '@rx-angular/state';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  standalone: true,
  providers: [RxState],
  imports: [
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  displayedColumns: string[] = [
    'position',
    'name',
    'weight',
    'symbol',
    'actions',
  ];

  // Reactive filter subject for input changes
  filterSubject: Subject<string> = new Subject<string>();

  constructor(public dialog: MatDialog, private state: RxState<{ dataSource: PeriodicElement[] }>) {}

  ngOnInit(): void {
    // Set the initial data into the state
    this.state.set({ dataSource: ELEMENT_DATA });

    // Connect the filter input and apply debounce and mapping
    this.state.connect(
      'dataSource',  // Key in the state to update
      this.filterSubject.pipe(
        debounceTime(2000),  // Wait 2 seconds after user input
        map((filterText) => this.applyFilter(filterText))  // Apply filtering
      )
    );
  }

  openEditDialog(element: PeriodicElement): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '300px',
      data: { ...element },  // pass a copy to avoid mutating original object
    });

    dialogRef.afterClosed().subscribe((result: PeriodicElement) => {
      if (result) {
        this.state.set({
          dataSource: this.updateElement(result),
        });
      }
    });
  }

  onFilterChange(event: any): void {
    this.filterSubject.next(event.target.value);  // Emit the value entered by the user
  }

  private applyFilter(filterValue: string): PeriodicElement[] {
    // Filter the initial ELEMENT_DATA based on the filter value
    return ELEMENT_DATA.filter((item) =>
      Object.values(item).some((val) =>
        val.toString().toLowerCase().includes(filterValue.toLowerCase())
      )
    );
  }

  private updateElement(updatedElement: PeriodicElement): PeriodicElement[] {
    // Update the specific element in the current data
    return this.state.get('dataSource').map((item) =>
      item.position === updatedElement.position ? updatedElement : item
    );
  }
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];
