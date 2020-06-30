/*
 * Copyright (c) 2020 INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and ODO Smart Systems
 *
 * This program has been developed in the context of the NOMAd project and is GPL v3 Licensed.
 * We would like to thank the European Union through the European regional development fund (ERDF) and the French region Auvergne-Rhône-Alpes for their financial support.
 * The following entities have been involved in the NOMAd project: INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and Odo Smart System.
 *
 * This file is part of NOMAd.
 *
 * NOMAd is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * NOMAd is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with NOMAd.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as moment from 'moment';
import { Route } from './route';
import { TransportPOI } from '../poi/poi';
import { Site } from '../site/site';
import { POIService } from '../poi/poi.service';
import { UTCTimePipe } from '../helpers/utc-time.pipe';
import { RoutePOI } from './route.poi';

/**
 * A set of routes
 */
export class RouteSet {
  // the set of routes
  list:Route[];
  // the available colors for new set of routes (if empty, we can not create new routes)
  availableColors: string[];
  // the active route (only one active route at the same time, "" if no active route)
  currentRouteId:string;
  // The next route index for a route
  nextRouteIndex:number;
  // The institutions attached to the set of routes
  institutions:Site[];
  // Tell whether the chosen timeslot is in the morning or in the afternon
  bMorning : boolean;
  // Tell whether some routes are loading or not
  bLoading : boolean;
  // The available colors for painting a route : these colors were generated by a script and are supposed
  //   to be quite different each other (difference in red + difference in blue + difference in green < 120)
  // Colors that were visually too close to the map base layer colors were put at the end of the list
  static colors = [ "#95006d", "#646400", "#d47103", "#083cf9", "#4bf515", "#5417b1", "#14ab8a",
                    "#0b0538", "#b70aeb", "#128921", "#fdcc1b", "#b11708", "#00fdb7", "#fa8991",
                    "#759d35", "#78aed3", "#d12486", "#e65ceb", "#7242ef", "#834144", "#0dd1f6",
                    "#2e3210", "#213879", "#bb7c65", "#1df25f", "#3871c8", "#a75cb2", "#f23131",
                    "#61f4f7", "#426c56", "#b79af8", "#a2b905", "#fd08b9",
                    // less visible colors compared to bap bas layer colors
                    "#96fe9a","#60d97b","#f4fa76","#a9f33c","#cfebd3"];

  /**
   *
   */
  constructor(private POIService: POIService) {
    this.institutions=[];
    this.list=[];
    this.currentRouteId="";
    this.nextRouteIndex=0;
    this.bLoading=false;
    this.availableColors=this.getAvailableRouteColor();
  }

  /**
   * Create a new route. We can do that only when some colors are available
   * @return Route : undefined in case the new route can not be created
   */
  newRoute() : Route{
    var oResult;
    if(this.availableColors.length>0){
      oResult=new Route(
        this.POIService,
        this.nextRouteIndex.toString(),
        this.availableColors[0],
        this.bMorning
      );
    }
    return oResult;
  }

  /**
   * Enable to load routes that were created from the user interface
   * @param newRoute : Route : a route that was created through the interface
   */
  addRoute(newRoute : Route){
    this.nextRouteIndex++;
    this.list.push(newRoute);
    this.currentRouteId=newRoute.routeId;
    this.availableColors = this.getAvailableRouteColor();
  }

  /**
   * Enable to load routes that were saved into database
   * @param newRoute : Route : a route that was extracted from database
   * @param bChanged : boolean : whether the route has to be saved into database or not
   * @return boolean : true if route is correctly loaded
   */
  loadRoute(route : Route,bChanged: boolean) : boolean{
    var bResult=false;
    if(this.availableColors.length>0){
      var index = this.nextRouteIndex.toString();
      this.nextRouteIndex++;
      // Create the new route
      var newRoute=new Route(
        this.POIService,
        index,
        this.availableColors[0],
        this.bMorning
      );
      // Copy the attributes generated by server
      newRoute.id=route.id;
      newRoute.bChanged=bChanged;
      newRoute.label=route.label;
      newRoute.start_hr=route.start_hr;
      newRoute.end_hr=route.end_hr;
      newRoute.distance=route.distance;
      newRoute.duration=route.duration;
      newRoute.vehicleCategory=route.vehicleCategory;
      newRoute.scenario_main_id=route.scenario_main_id;
      newRoute.optim_main_id=route.optim_main_id;
      newRoute.driver=route.driver;
      newRoute.start_driver_dt=route.start_driver_dt;
      newRoute.end_driver_dt=route.end_driver_dt;
      newRoute.POIs=route.POIs;
      newRoute.errors=route.errors;
      newRoute.simplifiedErrors=route.simplifiedErrors;
      this.list.push(newRoute);
      this.availableColors = this.getAvailableRouteColor();
      bResult=true;
    }
    return bResult;
  }


  /**
   * Compute the set of available colors (difference between all declared colors and already used colors)
   * @return string[] : the available colors
   */
  private getAvailableRouteColor() :string[]{
    var usedColors=[];
    for(let route of this.list){
      usedColors.push(route.color);
    }
    var availableColors = RouteSet.colors.filter(function(i) {return usedColors.indexOf(i) < 0;});
    return availableColors;
  }

  /**
   * Delete a route from the route set and update the set of available colors accordingly
   * @param route Route : the deleted route
   */
  deleteRoute(route : Route){
    if(this.currentRouteId==route.routeId){
      this.currentRouteId="";
    }
    for(var i=0;i<this.list.length;i++){
      if(this.list[i].routeId==route.routeId){
        this.list.splice(i,1);
        break;
      }
    }
    this.availableColors = this.getAvailableRouteColor();
  }

  /**
   * Remove all routes with the optim_main_id set equal to sOptimMainId
   * @param string : sOptimMainId : the optim_main_id for whoch we want to delete all routes
   */
  deleteOptimizedRoutes(sOptimMainId : string){
    if(sOptimMainId!=undefined){
      var length = this.list.length;
      for(var i=0;i<length;i++){
        // Since we are splicing some elements, we have to loop from the last element to the first element
        if(this.list[length-i-1].optim_main_id==sOptimMainId){
          this.list.splice(length-i-1,1);
        }          
      }
    }
  }

  /**
   * Get some data among the set of institutions attached to the set of routes
   * @param id string : id of the institution for which we need some details
   * @return Site : some details about an institution attached to the route
   */
  getInstitution(id){
    var result = new Site();
    for(let institution of this.institutions){
      if(institution.id==id){
        result=institution;
        break;
      }
    }
    return result;
  }

  /**
   * Add a POI to a the current route
   * @param POI TransportPOI : the POI to be added
   */
  addPOI(POI : TransportPOI){
    for(let route of this.list){
      if(route.routeId==this.currentRouteId){
        if(POI.transport_demand_institution_id){
          // Check whether the origin or destination institution is present in the route, and if not insert it in the
          //  route.
          if(!route.checkInstitutionPOI(POI.transport_demand_institution_id)){
            route.addInstitutionPOI(this.getInstitution(POI.transport_demand_institution_id));
          }
        }
        else{
          // Check that institutions attached to the POI are already in the route, and if not add one institution to
          //   the route
          var bInstitutionFound=false;
          for(let institution of POI.institutions){
            if(route.checkInstitutionPOI(institution.id)){
              bInstitutionFound=true;
              break;
            }
          }
          // If no institution was found, add the first one in the list
          if(!bInstitutionFound){
            if(POI.institutions.length>0){
              route.addInstitutionPOI(this.getInstitution(POI.institutions[0].id));
            }
          }
        }
        route.addPOI(POI);
        break;
      }
    }
  }

  /**
   * Get the current route
   * @return Route : the current route.
   */
  getCurrentRoute() : Route{
    var result : Route;
    for(let route of this.list){
      if(route.routeId==this.currentRouteId){
        result=route;
        break;
      }
    }
    return result;
  }

  /**
   * Return true when at least of route of the route set has changed
   * @param boolean bWithoutOptimizedRoutes : if true, ignore optimized routes
   * @return boolean : whether there are some changes routes or not
   */
  hasChanged(bWithoutOptimizedRoutes) : boolean{
    var bChanged= false;
    for(let route of this.list){
      if(route.bChanged){
        if(bWithoutOptimizedRoutes && route.optim_main_id){
          continue;
        }
        bChanged = true;
        break;
      }
    }
    return bChanged;
  }

  /**
   * Get the number of optimized routes among all the routes
   * @return integer : the number of optimized routes
   */
  countOptimizedRoutes(){
    var i=0;
    for(let route of this.list){
      if(route.optim_main_id){
        i++;
      }
    }
    return i;
  }

  /**
   * Update all the routes containing the input POI with the new POI service duration
   * @param updatedPOI RoutePOI : POI for which the service duration was modified
   */
  updateServiceDuration(updatedPOI : RoutePOI){
    // First update the set of institutions
    for(let institution of this.institutions){
      if(institution.poi_id == updatedPOI.id){
        institution.service_duration=updatedPOI.service_duration;
      }
    }
    // Then update the routes
    for(let route of this.list){
      for(let POI of route.POIs){
        if(POI.id == updatedPOI.id){
          POI.service_duration=updatedPOI.service_duration;
          if(POI.waiting_duration!=updatedPOI.waiting_duration){
            POI.waiting_duration=updatedPOI.waiting_duration;
            route.bChanged=true;
          }
          route.computeAcceptableDurations();
        }
      }
    }
  }

  /**
   * Tell whether a POI belongs to a route among the set of routes
   * @param POI : TransportPOI : a POI for which we want to know whether it belongs to at least one of the routes
   * @return boolean : true if the point belongs to at least one route
   */
  isSelected(POI : TransportPOI){
    var bFound = false;
    for(let route of this.list){
      for(let routePOI of route.POIs){
        if(routePOI.id == POI.id){
          bFound = true;
          break;
        }
      }
      if(bFound){
        break;
      }
    }
    return bFound;
  }

  /**
   * Tell wether a POI belongs to current route or not
   * @param POI : TransportPOI : a POI for which we need to test whether it belongs to the current route
   * @return boolean : true if the POI is in current route
   */
  isInCurrentRoute(POI : TransportPOI){
    var result = false;
    var currentRoute = this.getCurrentRoute();
    if(currentRoute != undefined && currentRoute.POIs != undefined){
      for(var i=0;i<currentRoute.POIs.length;i++){
        if(currentRoute.POIs[i].id == POI.id){
          result = true;
          break;
        }
      }
    }
    return result;
  }

  /**
   * If the POI belongs to the current route, return the index of the POI in the current route + an error level code ("ERROR" or "INFO" or "WARNING" of "")
   * @param POI : TransportPOI : a POI for which we need to test whether it belongs to the current route
   * @return object : the index of the POI in the current route, undefined if the POI does not belong to the current route + an error level
   */
  getIndexInCurrentRoute(POI : TransportPOI){
    var oResult = {iIndex:undefined,sLevel:''};
    var currentRoute = this.getCurrentRoute();
    if(currentRoute != undefined && currentRoute.POIs != undefined){
      for(var i=0;i<currentRoute.POIs.length;i++){
        if(currentRoute.POIs[i].id == POI.id){
          oResult.iIndex = i;
          break;
        }
      }
      // Check the errors on the POI
      if(currentRoute.errors!=undefined){
        for(var i=0;i<currentRoute.errors.length;i++){
          if(currentRoute.errors[i].site_poi_id==POI.id){
            oResult.sLevel = currentRoute.errors[i].level_code;
          }
        }
      }
    }
    return oResult;
  }

  /**
   * Get the list of institution IDs involved by the set of routes
   * @return {id:string}[] : a list of institution IDs
   */
  getInvolvedInstitutions() : {id:string}[]{
    var result :{id:string}[]= [];
    for(let route of this.list){
      for(let routePOI of route.POIs){
        if(routePOI.site_type_code=='HOME'){
          // The current POI is a home POI : collect each of its institutions
          for(let POIInstitution of routePOI.institutions){
            var bFound=false;
            for(let institution of result){
              if(POIInstitution.id==institution.id){
                bFound=true;
                break;
              }
            }
            if(!bFound){
              result.push({id:POIInstitution.id})
            }
          }
        }
        else{
          // The current POI is an institution POI : add the corresponding institution to the list
          var bFound=false;
          for(let institution of result){
            if(routePOI.site_main_id==institution.id){
              bFound=true;
              break;
            }
          }
          if(!bFound){
            result.push({id:routePOI.site_main_id})
          }
        }
      }
    }
    return result;
  }

  /**
   * Get the label to be displayed within the map marker tooltip
   * @param POI TransportPOI : the POI for which we need the marker label
   * @return string : the label for the marker
   */
  getMarkerLabel(POI : TransportPOI) : string{
    // Since POI is obtained by coping input data, it may not have a getPNGIcon available
    // So we explicitely created a RoutePOI object for that
    var tempPOI = new RoutePOI();
    tempPOI.transport_mode_code=POI.transport_mode_code;
    tempPOI.site_type_code=POI.site_type_code;
    var sInfo = '<div style="max-width:300px">';
    // If the input POI belongs to the currentRoute, display the index of the POI in the route
    var iIndexInCurrentRoute = this.getIndexInCurrentRoute(POI).iIndex;
    if(iIndexInCurrentRoute!==undefined){
      sInfo+="<strong class='h4' style='vertical-align:middle'>"+(iIndexInCurrentRoute+1)+".</strong>&nbsp";
    }
    sInfo+=tempPOI.getPNGIcon();
    if(POI.site_type_code=='HOME'){
      // Person name
      sInfo+=" <button class='link-to-hr btn btn-link' id='"+POI.hr_id+"'>"+POI.hr_firstname + ' ' + POI.hr_lastname+"</button>";
      // Person acceptable travel duration
      if(POI.label!=null && POI.label!=undefined && POI.label!=''){
        sInfo+='<div style="text-align: center;font-weight:bold">'+POI.label+'</div>';
      }
      sInfo+='<div>'+POI.hr_gender_label;
      if(POI.hr_birthday_dt!=null && POI.hr_birthday_dt>0){
        sInfo+=' de '+moment().diff(moment(POI.hr_birthday_dt), 'years')+" ans";
      }
      sInfo+='</div>';
      // Person pickup time windows
      if(this.bMorning){
        if(POI.pickupStartHour!=null && POI.pickupEndHour!=null){
          sInfo+='<div> Départ entre ';
          sInfo+=new UTCTimePipe().transform(POI.pickupStartHour) + " et ";
          sInfo+=new UTCTimePipe().transform(POI.pickupEndHour)
          sInfo+='</div>';
        }
        if(POI.transport_demand_institution_label){
          sInfo+='<div> Arrivée : ';
          sInfo+=POI.transport_demand_institution_label;
          sInfo+='</div>';
        }
      }
      // Person delivery time windows
      if(!this.bMorning){
        if(POI.transport_demand_institution_label){
          sInfo+='<div> Départ : ';
          sInfo+=POI.transport_demand_institution_label;
          sInfo+='</div>';
        }
        if(POI.deliveryStartHour!=null && POI.deliveryEndHour!=null){
          sInfo+='<div> Arrivée entre ';
          sInfo+=new UTCTimePipe().transform(POI.deliveryStartHour) + " et ";
          sInfo+=new UTCTimePipe().transform(POI.deliveryEndHour)
          sInfo+='</div>';
        }
      }
      // POI acceptable travel duration
      if(POI.acceptableDuration!=null && POI.acceptableDuration>0){
        sInfo+='<div> Durée de trajet acceptable : ';
        sInfo+=Math.round(POI.acceptableDuration/60000) + " minutes"
        sInfo+='</div>';
      }
      // Person crisis risk
      if(POI.hr_crisis_risk!=null && POI.hr_crisis_risk!=undefined){
        sInfo+='<div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"> Risque de crise : ';
        sInfo+=POI.hr_crisis_risk
        sInfo+='</div>';
      }
      // Person specific arrangements
      if(POI.hr_specific_arrangement!=null && POI.hr_specific_arrangement!=undefined){
        sInfo+='<div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"> Aménagements spécifiques : ';
        sInfo+=POI.hr_specific_arrangement
        sInfo+='</div>';
      }
    }
    else{
      sInfo+=" <button class='link-to-institution btn btn-link' id='"+POI.site_main_id+"'>"+POI.label+"</button>";
    }
    // Closing the main div
    sInfo += '</div>';
    // Compute the list of routes the POI belongs to
    var routes = "";
    for(var i=0;i<this.list.length;i++){
      for(let routePOI of this.list[i].POIs){
        if(POI.id==routePOI.id){
          var label ="";
          if(this.list[i].label!=undefined && this.list[i].label!=""){
            label = this.list[i].label;
          }
          else{
            label = (i+1).toString();
          }
          routes+="<div><strong style='color:"+this.list[i].color+"'> Tournée "+label+"</strong></div>";
          break;
        }
      }
    }
    if(routes==""){
      routes="Aucune tournée"
    }
    var sHTML = "";
    if(POI.site_type_code=='HOME'){
      var institutions = "";
      for(let institution of POI.institutions){
        institutions+="<div>inscrit à <button class='link-to-institution btn btn-link' id='"+institution.id+"'>"+institution.label+"</button></div>";
      }
      var sHTML = "<div class='card'> \
                <div class='card-header'>{{info}}</div> \
                <ul class='list-group list-group-flush'> \
                  <li class='list-group-item'>{{routes}}</li> \
                  <li class='list-group-item'>{{institutions}}</li> \
                </ul> \
              </div>";
      sHTML = sHTML.replace("{{institutions}}", institutions);
    }
    else{
      var sHTML = "<div class='card'> \
                <div class='card-header'>{{info}}</div> \
                <div class='card-body'> \
                  {{routes}} \
                </div> \
              </div>";
    }
    return sHTML.replace("{{info}}", sInfo).replace("{{routes}}", routes);
  }

  /**
   * Count the number of distinct HR POIs involved in the routes
   */
  countHRPOIs(){
    var HRPOIs = [];
    var result = 0;
    for(let route of this.list){
      var routeHRPOIs = route.getHRPOIs()
      for(var hr_id in routeHRPOIs){
        if(HRPOIs[hr_id] == undefined){
          HRPOIs[hr_id]=routeHRPOIs[hr_id];
          result++;
        }
      }
    }
    return result;
  }
}