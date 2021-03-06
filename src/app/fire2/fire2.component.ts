import { Component, OnInit } from '@angular/core';
import {
  AngularFire,
  FirebaseObjectObservable, FirebaseListObservable,
  AuthMethods, AuthProviders  } from 'angularfire2';
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergemap';
import 'rxjs/add/operator/switchMap';

@Component({
  moduleId: module.id,
  selector: 'app-fire2',
  templateUrl: 'fire2.component.html',
  styleUrls: ['fire2.component.css']
})
export class Fire2Component implements OnInit {
  title = 'AngularFire2: Demo';
  itemKey: any;
  word: FirebaseObjectObservable<any>;  // ObjectObservable
  words: FirebaseListObservable<any[]>; // ListObservable
  abnormal: FirebaseObjectObservable<any>;  // ObjectObservable
  sizeSubject: Subject<any>;
  mapitems: Observable<any[]>; // ListObservable

  value1: string;
  value2: string;
  value$: FirebaseObjectObservable<any>;;

  constructor( public af: AngularFire ) {
    this.sizeSubject = new Subject();
    this.words = af.database.list('/items', {
     // preserveSnapshot: true,
     // Bug: updateItem
     /*
     query: {
        orderByKey: true,
        // orderByChild: 'size',
        equalTo: this.sizeSubject
     }
      */
    });
    this.word = af.database.object('/items');
  }

  ngOnInit() {
        this.words.subscribe( item => {
      console.log('Item.subscribe: ' + item );
    });
    this.words.forEach( item => {
      let s = JSON.stringify(item);
      console.log( s );

      item.forEach( item => {
        // let n = item['name'];
        let n = item.name;
        let k = item.$key;
        let s = JSON.stringify(item);
        console.log( s + ', key: ' + k + ', name: ' + n );
      });
    })
    .then( n =>  console.log('forEach: End' + n))
    .catch( e => console.log(e));
    /* For preserveSnapshot: true
    this.items
      .map(snapshots => {
        snapshots.forEach(snapshot => console.log(snapshot.key()));
      })
      .subscribe(snapshots => console.log(snapshots));
    */
    // this.item = this.items[0];

    this.getAbnormalValue( "cmu" );
  }

  /* Get JSON Value
   * Don't unwrap the observable until you're ready to subscribe,
   * which is what the async pipe does.
   * https://github.com/angular/angularfire2/issues/357
   *
   * Template String(Back ticks: `` not '' )
   * http://stackoverflow.com/questions/27678052/what-is-the-usage-of-the-backtick-symbol-in-javascript
   * Template strings can be used multi line and may use "interpolation" to insert the content of variables:
   * var a = 123, str = `--- a is: ${a} ----`;
   * console.log(str); --> a is: 123
  {
    items: {
      abnormal: {
        cmu: "CMU Value"
      }
    }
  }
 **/
  getAbnormalValue( type: string ) {
    this.abnormal = this.af.database.object('/items/abnormal');
    this.abnormal.subscribe( snapshot => {
      console.log('SnapshotResult: ' + snapshot[type]);
      this.value1 = snapshot.cmu;
    });
    this.value$ = this.af.database.object(`/items/abnormal/${type}`);
    this.value$.subscribe( cmu => {
      this.value2 = cmu.$value;
    });
  }

  //JavaScript: String, TypeScript: string
  set(newKey: string, newName: string, newSize: string ) {
    // Converting a JSON Text to a JavaScript Object
    // JSON.parse() Error: Use '..' instead of ".."
    // http://www.w3schools.com/js/js_json.asp
    // Error: let jsonString:string  = "{" + newKey + ":{ name: " + newName + ", size: " + newSize + "}}";
    // ComputedPropertyName: Using a variable for a key in a JavaScript object literal
    // http://stackoverflow.com/questions/2274242/using-a-variable-for-a-key-in-a-javascript-object-literal
    let jsonString:string = '{' + '"' + newKey + '"'
      + ': { "name": ' + '"' + newName + '"' + ', "size": ' + '"' + newSize + '"' + '}}';
    let jsonObj = JSON.parse(jsonString);
    console.log( "DBG" + JSON.stringify(jsonObj));
    this.word.set(
      // jsonObj
      {[newKey]: { name: newName, size: newSize }}
    )
    .then( _ => console.log("Success"))
    .catch( err => console.log(err, "Failed"));
  }

  // For FirebaseObjectObservable<any>
  update( updateKey: string, newName: string, newSize: string) {
   this.word.update(
      {[updateKey]: { name: newName, size: newSize }}
   )
   .then(_ => console.log("Update Size: OK"))
   .catch( e => console.log("Update Size: Fail"));
    console.log("Item Updated");
  }

  // For FirebaseListObservable<any[]>
  push( newName: string, newSize: string ) {
    this.words.push({ name: newName, size: newSize });
  }

  updateItem( key: string, newName: string, newSize: string ) {
   this.words.update( key, {name: newName, size: newSize})
   .then(_ => console.log("Update Item: OK"))
   .catch( e => console.log("Update Item: Fail"));
    console.log("Item Updated");
  }

  delete() {
    console.log("Item Deleted");
  }

  filterBy( size: string) {
      this.sizeSubject.next(size);
      console.log("filter: " + size);
  }
}
