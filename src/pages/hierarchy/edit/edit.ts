import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Base64 } from '@ionic-native/base64/ngx';


@IonicPage()
@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {

  item: any;
  dataObject: any;
  dataURI: any;
  isDataPresent: boolean;
  base64Data: any;
  image: any;
  //String for filtering in html
  uniqueIDCheck = "Unique Identifier";

  tzOffset: any;

// navParams.data contains the following:
//  [0] - JSON containing:
//    The selected item's Characteristics (Characteristics)
//    The selected items parent (ChildOf)
//    The selected items children (ParentOf)
//    The selected item's pluralization (Plural)
//  [1] - The URI to retrieve the metadata from (dataURI)
//  [2] - JSON Containing the info for the next level [TODO: this is wrong, fix it]
  constructor(public navCtrl: NavController, public http: HttpClient, public navParams: NavParams, private base64: Base64) {

      this.item = navParams.data[0];
      this.dataObject = navParams.data[1];
      // DEBUG:
      //console.log(this.dataURI);
      //If there is a photo, display image
      if(navParams.data[1].Photo != null){
        this.image = "data:image/png;base64,"+ navParams.data[1].Photo;
      }
      this.editDateFields();
      //console.log(this.image);
  }


  editDateFields()
  {
    //if item.Characteristics.datatype == 'xsd:datetime'
    //Debug Logs
    //console.log(this.item["Characteristics"].length);
    for( var i = 0 ; i < this.item["Characteristics"].length ; i++ )
   {
      //console.log(this.item["Characteristics"][i]["datatype"]);
     if(this.item["Characteristics"][i]["datatype"] == 'xsd:datetime')
     {
          //Debug logs
          console.log(this.dataObject);
         this.dataObject[ this.item["Characteristics"][i]["Label"] ] = this.displayTime(this.item["Characteristics"][i], this.dataObject[ this.item["Characteristics"][i]["Label"] ]);
     }
    }
  }

  /**
  * @brief
  * @pre
  * @post
  */
  displayTime(characteristic, dataIndex)
  {
    var referenceCalculationLabel;
    if(characteristic["datatype"] == 'xsd:datetime')
    {
      referenceCalculationLabel = characteristic.TimezoneOffsetLabel;
    }
    // for(var i=0; i<MAX_CHARACTERISTICS ; i++)
    // {
    //   if(hierarchy[i].Label == referenceCalculationLabel)
    //   {
    //     this.tzOffset = this.dataObject[referenceCalculationLabel];
    //   }
    // }

    if(this.tzOffset == null)
    {
      var time = new Date();
      this.tzOffset = time.getTimezoneOffset();
    }

     var displayDate = new Date(dataIndex);
     var displayTime = new Date(displayDate.getTime() + this.tzOffset * 60 * 1000);
     var hourOffset = this.tzOffset/60;
     displayTime.setHours(displayDate.getHours() - hourOffset);
     //Debug Log
     console.log(displayDate.getMonth());
     var display = this.pad(displayDate.getMonth() + 1)
                    + '/'
                    + this.pad(displayDate.getDate())
                    + '/'
                    + displayDate.getFullYear()
                    + ',   '
                    + this.pad(displayTime.getHours())
                    + ':'
                    + this.pad(displayTime.getMinutes())
                    + ':'
                    + this.pad(displayTime.getSeconds());

     return display;

  }

  /**
  * @brief adds a leading '0' to single digit number dates to make them 2-digit
  * @param n the numerical digit to 'pad'
  * @pre
  * @post
  */
   pad(n){
     if(n<10)
       return '0' + n;
     else
       return n;
   }


}
