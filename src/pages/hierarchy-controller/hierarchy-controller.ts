/**
* @file  hierarchy.ts
* @author  Brianna Blain-Castelli, Christopher Eichstedt, Matthew Johnson, Nicholas Jordy
* @brief  controller file for hierarchichy
*/

import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GlobalvarsProvider } from '../../providers/globalvars/globalvars';
import { HomePage } from '../home/home';
import { HierarchyPage } from '../hierarchy/hierarchy';
import { GlobalDataHandlerProvider } from '../../providers/global-data-handler/global-data-handler';
import { HierarchyControllerProvider } from '../../providers/hierarchy-controller/hierarchy-controller';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-hierarchy-controller',
  templateUrl: 'hierarchy-controller.html',
})

export class HierarchyControllerPage {

  // URL for getting the specific data only. Not Public URI list.
  // (Use dataHandler.getSubUris() for public)
  subURI: any;
  loadingScreens = [];
  isError = false;
  isTest = false;

  /**
  * @brief Constructor for the hierarchy-controller
  * @param
  * @pre
  * @post
  */
  constructor(public http: HttpClient, public navCtrl: NavController, public navParams: NavParams, public loadingController: LoadingController,
    public gvars: GlobalvarsProvider, public dataHandler: GlobalDataHandlerProvider, public hierarchyGlobals: HierarchyControllerProvider, public storage: Storage) {
      this.loadAll();
  }

  /**
  * @brief loadAll
  *
  * @details Calls all loading screen and data loading functions
  *
  * @par Algorithm
  * 1. Show a loading screen before trying to retrieve data. (load screens stored in array)
  * 2. Attempts to retrieve data.
  * 3. Waits for each data item to be finished loading.
  * 4. Once loaded, remove the loading screen for that data item.
  * 5. Removes the created load screens from the array.
  * - Assumptions: No other function is adding load screens.
  *                Error handling screens are added independntly.
  *
  * @return none
  */
  async loadAll()
  {
    if(this.gvars.getOnline())
    {
      this.loadOntologyWaiting();
      try { await this.getOntology();}
      catch (err) {return;}
      await this.loadDataWaiting();
      try { await this.getAllData();}
      catch (err) {return;}
      while(!this.hierarchyGlobals.getOntologyDoneLoading() && !this.isError){await this.delay(100);}
      await this.loadingScreens[this.loadingScreens.length - 2].dismiss();
      while(!this.hierarchyGlobals.getDataDoneLoading() && !this.isError){await this.delay(100);}
      await this.loadingScreens[this.loadingScreens.length - 1].dismiss();
      this.loadingScreens.pop();
      this.loadingScreens.pop();
      if(!this.isError)
      {
        if(this.isTest)
        {
          this.goHierachyPageTest();
        }
        else
        {
          this.goHierachyPage();
        }
      }
    }
    else
    {
      await this.showError({status: 'Offline'}, 'Connection');
    }
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

      /* Hierarchy requires the following values:
      * hierarchydepth - HierchyDepth describes the initial tier index of the ontology/hierarchy. It is also the initial index of the location of data in dataObject
      * name - Name is the name used as a label on the hierarchy (metadata management) page.
      * pageData - This object is the full set of data pulled from the database which contains the actual metadata for all hierarchy tiers
      * hierarchyData -  This object is the full set of hierarchyData tiers
      * indentifier - This should be the unique identifier value for the previous page in the hierarchy.  null for the initial push.
      * pathName - this string is the pluralization of the Name which will be used for finding the URI and show the name of the hierarchy level.
      */

      //let localValues = {hierarchydepth:0, name:"NRDC", pageData:this.dataObject, hierarchyData:this.hierarchyTiers, identifier:null, pathName:this.hierarchyTiers[0].Plural};
      // DEBUG
      // console.log(this.dataHandler.getDataObjects());
      let localValues = {hierarchydepth:0, name:"NRDC", identifier:null, pathName:this.dataHandler.getHierarchyTiers()[0].Plural};
      this.navCtrl.setRoot(HierarchyPage,localValues);
  }

  goHierachyPageTest(){

      /* Hierarchy requires the following values:
      * hierarchydepth - HierchyDepth describes the initial tier index of the ontology/hierarchy. It is also the initial index of the location of data in dataObject
      * name - Name is the name used as a label on the hierarchy (metadata management) page.
      * pageData - This object is the full set of data pulled from the database which contains the actual metadata for all hierarchy tiers
      * hierarchyData -  This object is the full set of hierarchyData tiers
      * indentifier - This should be the unique identifier value for the previous page in the hierarchy.  null for the initial push.
      * pathName - this string is the pluralization of the Name which will be used for finding the URI and show the name of the hierarchy level.
      */

      //let localValues = {hierarchydepth:0, name:"NRDC", pageData:this.dataObject, hierarchyData:this.hierarchyTiers, identifier:null, pathName:this.hierarchyTiers[0].Plural};
      // DEBUG
      // console.log(this.dataHandler.getDataObjects());
      let localValues = {hierarchydepth:0, name:"TEST", identifier:null, pathName:this.dataHandler.getHierarchyTiers()[0].Plural};
      this.navCtrl.setRoot(HierarchyPage,localValues);
  }

    /**
  * @brief goHome
  * @post User will be at the home page.
  */
  async goHome()
  {
    this.navCtrl.setRoot(HomePage);
  }

  /**
  * @brief showError
  *
  * @details Shows a loading symbol and displays an error briefly when
  * a connection error has occurred.
  *
  * @exception Boundary
  * None
  *
  * @param[in]
  * error is the error code status value
  * loadPage is the specific data item trying to be downloaded
  *
  * @param[Out] None
  *
  * @return None
  */
  async showError(error, loadPage)
  {
      this.isError = true;
      // Failed to load: set statuses accordingly
      if(loadPage == 'hierarchy')
      {
        this.hierarchyGlobals.setOntologySynced(false);
        this.hierarchyGlobals.setOntologyLoaded(false)
        this.hierarchyGlobals.setOntologyDoneLoading(false);
        this.hierarchyGlobals.setDataSynced(false);
        this.hierarchyGlobals.setDataLoaded(false);
        this.hierarchyGlobals.setDataDoneLoading(false);
      }
      else // error in data
      {
        this.hierarchyGlobals.setDataSynced(false);
        this.hierarchyGlobals.setDataLoaded(false);
        this.hierarchyGlobals.setDataDoneLoading(false);
      }
      // the fun synchronous asynchronous code block -----------
      console.log('Error retrieving data for ' + loadPage + '.\n Status: ' + error.status);
      let loading =  this.loadingController.create({
            spinner: null,
            duration: 2500,
            content: 'Error retrieving data for ' + loadPage + '.<p> Status: ' + error.status,
            cssClass: 'custom-class custom-loading'
          });
      this.loadingScreens.push(loading);
      this.loadingScreens[this.loadingScreens.length - 1].present();
      this.loadingScreens.pop();
      this.goHome();
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
    // Sync for ontology is rare event
    if(!this.hierarchyGlobals.getOntologySynced()){
      if(!this.hierarchyGlobals.getOntologyLoaded()){
        // BEWARE: possibly volatile and could not save actual data
        // If getting hierarchy returns true then it is synced and loaded.
        // Otherwise return failure
        try {this.getHierarchyData();}
        catch(error) {throw error;}
        this.hierarchyGlobals.setOntologyLoaded(true);
        this.hierarchyGlobals.setOntologySynced(true);
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
    // Sync for data is a potentially common event
    if(!this.hierarchyGlobals.getDataSynced()){
      if(!this.hierarchyGlobals.getDataLoaded()){
        try {this.getData();}
        catch(error) {console.log('error = ' + error); throw error;}
        this.hierarchyGlobals.setDataSynced(true);
        this.hierarchyGlobals.setDataLoaded(true);
      }
      else{
        // internal
        // ask user to confirm sync
      }
    }
    else
    {
      if(!this.hierarchyGlobals.getDataLoaded())
      {
          this.storage.get('localDataObject').then( data =>
          {
            console.log(data);
            let localData = data;
            this.dataHandler.setDataObject(localData);
            this.isTest = true;
            this.hierarchyGlobals.setDataDoneLoading(true);
            this.hierarchyGlobals.setDataLoaded(true);
          });
      }
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
  async loadOntologyWaiting()
  {
      let loading = this.loadingController.create({
        spinner: null,
        content: 'Downloading hierarchy...',
        cssClass: 'custom-class custom-loading'
      });
      this.loadingScreens.push(loading);

      if(!this.hierarchyGlobals.getOntologyDoneLoading())
      {
        await this.loadingScreens[this.loadingScreens.length - 1].present();
      }
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
  async loadDataWaiting()
  {
      let loading = this.loadingController.create({
          spinner: null,
          content: 'Downloading data...',
          cssClass: 'custom-class custom-loading'
        });
      this.loadingScreens.push(loading);
      // Only show loading screen if loading is required
      if(!this.hierarchyGlobals.getDataDoneLoading())
      {
        await this.loadingScreens[this.loadingScreens.length - 1].present();
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
  * @post hierarchyTiers contains the (ontology = hierarchy = tier) data.
  *
  * @exception Boundary
  * Failure to load, specifically Offline or Timeout shall throw an exception.
  *
  * @return None
  */
  async getHierarchyData()
  {
    // TODO: Create a config setting for this
    // Local location containing the Ontology
    // let local = '../../assets/data/test.json';
    // Remote service containing the ontology
    //let remote = 'http://sensor.nevada.edu/GS/Services/Ragnarok/';
    let remote = '../../assets/data/ontology.json';
    let data: Observable<any> = this.http.get(remote);
    this.hierarchyGlobals.setOntologyDoneLoading(false);
    // this.isOntologyDoneLoading = false;
    data.subscribe(result =>
      {
        // Grab the json results from Ragnarok (hierarchy)
        // (i.e. Site-Networks, Sites, Systems, Deployments, Components
        let hierarchyTiers = result;
        // LABEL: GLOBAL DATA
        this.dataHandler.setHierarchyTiers(hierarchyTiers);
        this.hierarchyGlobals.setOntologyDoneLoading(true);
        this.storage.set('ontology', this.dataHandler.getHierarchyTiers());
        // this.isOntologyDoneLoading = true;
      },
      error =>
      {
        this.showError(error, 'hierarchy');
        throw error;
      }
    );
    return true;
  }

  /**
  * @brief Database data retrieval.
  *
  * @details  Gets the data from each tier's URI that accesses the database. Stores all data in a javascript object.
  *
  * @pre None
  *
  * @post dataObject will contain the data from the database. subURI will contain remote paths to data.
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
    let hierarchyTiers = this.dataHandler.getHierarchyTiers();
    for (i; i < hierarchyTiers.length; i++)
    {
      // re-indexing. required to index appropriately due to JS scoping
      let ii = i;
      // Proper viewing name of header
      this.subURI = hierarchyTiers[ii].Plural;
      // Create URL for the hierarchyTiers from this header (removing spaces first)
      this.subURI = this.subURI.replace(/ +/g, "");
      // e.g. http://sensor.nevada.edu/Services/NRDC/Infrastructure/Services/Sites.svc/
      this.dataHandler.subURIPush(dataRemote + this.subURI + ".svc/", ii);
      // Add Get portion
      // (e.g. http://sensor.nevada.edu/Services/NRDC/Infrastructure/Services/Sites.svc/Get)
      this.subURI = dataRemote + this.subURI + ".svc/Get";

      let data: Observable<any> = this.http.get(this.subURI);
      // let data: Observable<any> = this.storage.get('localDataObject').then(result =>

      await data.subscribe(result =>
        {
        // LABEL: GLOBAL DATA
        this.dataHandler.dataObjectPush(result, ii);

         if(i == hierarchyTiers.length)
         {
           this.hierarchyGlobals.setDataDoneLoading(true);
         }
        },
        error =>
        {
          this.showError(error, '' + hierarchyTiers[ii].Plural);
        }
      );
      // Pulled data from server so it is synced to server by default
      this.hierarchyGlobals.setHierarchyUpdateStatus(false, ii);
    }
  }
}
