/**
* @file  hierarchy.ts
* @author  Brianna Blain-Castelli, Christopher Eichstedt, Matthew johnson, Nicholas Jordy
* @brief  controller file for hierarchichy
*/

import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GlobalvarsProvider } from '../../providers/globalvars/globalvars';
import { HomePage } from '../home/home';
import { File } from '@ionic-native/file';
import { HierarchyPage } from '../hierarchy/hierarchy';

@IonicPage()
@Component({
  selector: 'page-hierarchy-controller',
  templateUrl: 'hierarchy-controller.html',
})

export class HierarchyControllerPage {

// boolean that stores whether ontology is synced
isOntologySynced: any;
// boolean that stores whether ontology is ontology laded
isOntologyLoaded: any;
// boolean that stores whether data is synced
isDataSynced: any;
// boolean that stores whether data is loaded
isDataLoaded: any;
// boolean that stores whether the ontology is done loading
isOntologyDoneLoading = false;
// boolean that stores whether the data is done loading
isDataDoneLoading = false;
// All locations in the Ontology
public items: any;
// URL for getting the specific data
public subURI: string;
// The data associated with the current hierarchy item (currently ALL data)
public dataObject: any;
// Shows the name of the current location in the hierarchy
public currentDisplayPath: any;
// Data on the current display page
public currentData: any;
// The unique identifier field of the hierarchy item passed to this hierarchy page.
uniqueIdentifier: any;
// The key (label) for the unique identifier value.
previousPathIDName: any;

  /**
* @brief Constructor for the hierarchy-controller
* @param
* @pre
* @post
*/
  constructor(public http: HttpClient, public navCtrl: NavController, public navParams: NavParams, public loadingController: LoadingController, public gvars: GlobalvarsProvider) {
      this.loadAll();
  }

  async loadAll()
  {
    //put a pin in it
    // TODO: Add try catch blocks for each function. Throw errors for offline and timeouts.
    this.getOntology();
    await this.loadOntologyWaiting();
    this.getAllData();
    await this.loadDataWaiting().then(() => {
      this.goHierachyPage();
    });
    // this.goHierachyPage();
    // Error if data loading fails. Otherwise go to the hierarchy page.
    // if(this.isOntologyLoaded && this.isDataLoaded){this.goHierachyPage();}
  }

  /**
  * @brief Go to the hierarchy page.
  *
  * @details Passes the ontology and database data that has been retrieved to the dynamic loading hierarchy page.
  *
  * @pre None
  *
  * @post None
  *
  * @par Algorithm
  * Creates a variable that stores the ontology, abd the database data and passes it to the
  *
  * @exception Boundary
  * None
  *
  * @return none
  */
  goHierachyPage(){


      //TODO: create the variables needed to pass to the hierarchy page.
      //this.navCtrl.push(HierarchyPage);
      //let localValues = {0, name:item.Name, currentPageData:item, identifier:item["Unique Identifier"], pathName:this.hierarchyTop.Plural};
      //Debug Logger
      //console.log(item);
      //console.log(this.previousPathIDName);
      this.navCtrl.setRoot(HierarchyPage);
  }

  /**
* @brief
* @param
* @pre
* @post
*/
  goHome()
  {
    this.navCtrl.setRoot(HomePage);
  }

  /**
  * @brief Hierarchy retrieval function
  *
  * @details Calls the function that performs the remote hierarchical data retrieval if appropriate to do so.
  *
  * @pre None
  *
  * @post None
  *
  * @par Algorithm
  * Checks for whether the ontology is already synced. If it is not, check if the ontology has been loaded previously.
  * If it has not, call the function to grab the remote data.
  *
  * @exception Boundary
  * Failure to load, specifically Offline or Timeout shall throw an exception.
  *
  * @param[in] None
  *
  * @param[Out] isOntologySynced isOntologyLoaded are updated if successful.
  *
  * @return None
  */

  async getOntology(){
    if(!this.isOntologySynced){
      if(!this.isOntologyLoaded){
        // BEWARE: possibly volatile and could not save actual data
        // If getting hierarchy returns true then it is synced and loaded.
        // Otherwise return failure
        this.getHierarchyData();
        this.isOntologySynced = this.isOntologyLoaded = true;
      }
    }
  }

  /**
  * @brief  Remote database data retrieval function
  *
  * @details Calls the function that performs the remote database data retrieval if appropriate to do so.
  *
  * @pre None
  *
  * @post None
  *
  * @par Algorithm
  * Checks for whether the database data is already synced. If it is not, check if the database data has been loaded previously.
  * If it has not, call the function to grab the remote data.
  *
  * @exception Boundary
  * Failure to load, specifically Offline or Timeout shall throw an exception.
  *
  * @param[in] None
  *
  * @param[Out] isDataSynced and isDataLoaded are updated based on succesful data retrieval.
  *
  * @return none
  */
  async getAllData(){
    if(!this.isDataSynced){
      if(!this.isDataLoaded){
        this.getData();
        this.isDataSynced = this.isDataLoaded = true;
      }
      else{
        // ask user to confirm sync
      }
    }
  }

  /**
  * @brief Hierarchy retrieval function
  *
  * @details Gets and stores the tiers/categories to be used in the app via a remote server.
  * This hierarchicy should be desribed in a JSON file created by the Ontology parsing back-end service.
  *
  * @pre None
  *
  * @post items contains the (ontology = hierarchy = tier) data.
  *
  * @exception Boundary
  * Failure to load, specifically Offline or Timeout shall throw an exception.
  *
  * @return None
  */
  async getHierarchyData()
  {
    let online = this.gvars.getOnline();
    // TODO: Create a config setting for this
    // Local location containing the Ontology
    let local = '../../assets/data/test.json';
    // TODO: Create a config setting for this
    // Remote service containing the ontology
    //let remote = 'http://sensor.nevada.edu/GS/Services/Ragnarok/';
    let remote = '../../assets/data/ontology.json';
    if(online)
    {
      let data: Observable<any> = this.http.get(remote);
      let isOntologyDoneLoading = false;
      data.subscribe(result => {
        // Grab the json results from Ragnarok (hierarchy)
        // (i.e. Site-Networks, Sites, Systems, Deployments, Components
        this.items = result;
        this.isOntologyDoneLoading = true;
      });
    }
    else
    {
      // THROW AN EXCEPTION ERROR
    }
  }

  /**
  * @brief Timer delay function
  *
  * @details Delay function that will wait a number of milliseconds.
  *
  * @pre None
  *
  * @post None
  *
  * @exception Boundary
  * None
  *
  * @param[in] ms is the number of milliseconds the function should wait.
  *
  * @return A promise indicating when the function is completed.
  */
  async delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  /**
  * @brief Data loading test.
  *
  * @details Shows a loading symbol while waiting for data being loaded.
  *
  * @exception Boundary
  * None
  *
  * @param[in] ____ is boolean value that is being tested against and is set when some data has been loaded.
  *
  * @param[Out] None
  *
  * @return None
  */
  // TODO: pass in variable for what value to test.
  async loadOntologyWaiting()
    {
        // the fun synchronous asynchronous code block -----------
        let loading = this.loadingController.create({
          spinner: null,
          content: 'Downloading hierarchy...',
          translucent: true,
          cssClass: 'custom-class custom-loading'
        });
        loading.present();
        while(!this.isOntologyDoneLoading){await this.delay(1);}
        loading.dismiss();
        // -----------
    }

    /**
    * @brief Data loading test.
    *
    * @details Shows a loading symbol while waiting for data being loaded.
    *
    * @exception Boundary
    * None
    *
    * @param[in] ____ is boolean value that is being tested against and is set when some data has been loaded.
    *
    * @param[Out] None
    *
    * @return None
    */
    // TODO: pass in variable for what value to test.
    async loadDataWaiting()
      {
          // the fun synchronous asynchronous code block -----------
          let loading = this.loadingController.create({
            spinner: null,
            content: 'Downloading data...',
            translucent: true,
            cssClass: 'custom-class custom-loading'
          });
          loading.present();
          while(!this.isDataDoneLoading){await this.delay(1);}
          loading.dismiss();
          // -----------
      }

  /**
  * @brief Database data retrieval.
  *
  * @details  Gets the data from each tier's URI that accesses the database. Stores all data in a javascript object.
  *
  * @pre None
  *
  * @post dataObject will contain the data from the database.
  *
  * @exception Boundary
  * None
  *
  * @param[in] ____ is boolean value that is being tested against and is set when some data has been loaded.
  *
  * @param[Out] None
  *
  * @return None
  */
  // This function actually gets the data from the URI accessing the database.
  async getData()
  {
    // TODO: Create a confi setting for this
    // Remote database service containing the metadata
    let dataRemote = 'http://sensor.nevada.edu/Services/NRDC/Infrastructure/Services/';
    // the fun synchronous asynchronous code block -----------
    // -----------
    let i = 0;
    for (i; i < this.items.length; i++)
    {
        // Proper viewing name of header
        this.subURI = this.items[i].Plural;
        // Create URL for the items from this header (removing spaces first)
        this.subURI = this.subURI.replace(/ +/g, "");
        this.subURI = dataRemote + this.subURI + ".svc/Get";

        //TODO: Update to add data for each level of hierarchy.
        //DEBUG
        //console.log(this.subURI);
        let data: Observable<any> = this.http.get(this.subURI);
        let result = null;

        await data.subscribe(result => {

          if(this.dataObject == null)
          {
            this.dataObject = result;
          }
          else
          {
            this.dataObject.push(result);
          }

         if(i == this.items.length)
         {
           console.log("DataDone");
           this.isDataDoneLoading = true;
         }
        });
    }
  }
}