
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GlobalvarsProvider } from '../../providers/globalvars/globalvars';
import { ReadPage } from './read/read';
import { HomePage } from '../home/home';


// @IonicPage()
@Component({
  selector: 'page-hierarchy',
  templateUrl: 'hierarchy.html',
})
export class HierarchyPage
{
  // All locations in the Ontology
  public items: any;
  // Current header from ontology
  public hierarchyTop: any;
  // URL for getting the specific data
  public subURI: string;
  // The data associated with the current hierarchy item (currently ALL data)
  public dataObject: any;
  // Shows the name of the current location in the hierarchy
  public currentDisplayPath: any;
  // Max depth of the hierarchy
  public maxIndex: any;

  hierarchyDepth = 0;
  constructor(public navCtrl: NavController, public http: HttpClient, public navParams: NavParams, public gvars: GlobalvarsProvider)
  {
    if(navParams.get('hierarchydepth') == null)
    {
      this.hierarchyDepth = 0;
    }
    else
    {
      this.hierarchyDepth = navParams.get('hierarchydepth');
    }

    this.currentDisplayPath = navParams.get('name');
    this.getHierarchyData(this.hierarchyDepth);
  }

  // DEBUG:
  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad HierarchyPage');
  // }

// Doesn't actually get the data. It gets the hierarchy/ontology! (RAGNAROK)
  getHierarchyData(depth)
  {
    let online = this.gvars.getOnline();
    // TODO: Create a confi setting for this
    // Local location containing the Ontology
    let local = '../../assets/data/db.json';
    // TODO: Create a confi setting for this
    // Remote service containing the ontology
    //let remote = 'http://sensor.nevada.edu/GS/Services/Ragnarok/';
    let remote = '../../assets/data/db.json';
    // TODO: Create a confi setting for this
    // Remote database service containing the metadata
    let dataRemote = 'http://sensor.nevada.edu/Services/NRDC/Infrastructure/Services/';
    if(online)
    {
      let data: Observable<any> = this.http.get(remote);
      data.subscribe(result => {
        // Grab the json results from Ragnarok (hierarchy)
        // (i.e. Site-Networks, Sites, Systems, Deployments, Components

        this.items = result;
        // Get the current header item
        this.hierarchyTop = result[depth];
        // Find max length of navigation (for bug catching)
        this.maxIndex = result.length;
        // increases to next header item
        this.hierarchyDepth = depth + 1;
        // Proper viewing name of header
        this.subURI = this.hierarchyTop.Plural;
        // Create URL for the items from this header
        this.subURI = this.subURI.replace(/ +/g, "");
        this.subURI = dataRemote + this.subURI + ".svc/Get";

        this.getNextData();
      });
    }
    else
    {
      let data: Observable<any> = this.http.get(local);
      data.subscribe(result => {
        this.hierarchyTop = result[depth];
        // Find max length of navigation (for bug catching)
        this.maxIndex = result.length;
        this.hierarchyDepth = depth + 1;
        this.items = result;});
    }
  }

  getNextData()
  {
    //DEBUG
    //console.log(this.subURI);
    let data: Observable<any> = this.http.get(this.subURI);
    data.subscribe(result => {
      this.dataObject = result;
      //DEBUG
      //console.log(this.dataObject);
    });
  }

  // push()
  // {
  //   let localValues = {hierarchydepth:this.hierarchyDepth};
  //   this.navCtrl.push(HierarchyPage,localValues);
  // }

  push(item)
  {
    if(this.hierarchyDepth <= this.maxIndex - 1)
    {
      let localValues = {hierarchydepth:this.hierarchyDepth, name:item.Name + " - "};
      this.navCtrl.push(HierarchyPage,localValues);
    }
  }

  goHome()
  {
    this.navCtrl.setRoot(HomePage);
  }

  viewCharacteristics()
  {
    let online = this.gvars.getOnline();
    if(online)//console.log(ReadPage, this.hierarchyTop, this.subURI);
    {
      this.navCtrl.push(ReadPage,[this.hierarchyTop,{dataURI:this.subURI}, this.dataObject]);
    }
  }
}
