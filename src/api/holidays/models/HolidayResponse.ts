/* tslint:disable */
/* eslint-disable */
/**
 * OpenHolidays API v1
 * Open Data API for public and school holidays
 *
 * The version of the OpenAPI document: v1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from "../runtime";
import type { RegionalScope } from "./RegionalScope";
import {
  RegionalScopeFromJSON,
  RegionalScopeFromJSONTyped,
  RegionalScopeToJSON,
  RegionalScopeToJSONTyped,
} from "./RegionalScope";
import type { TemporalScope } from "./TemporalScope";
import {
  TemporalScopeFromJSON,
  TemporalScopeFromJSONTyped,
  TemporalScopeToJSON,
  TemporalScopeToJSONTyped,
} from "./TemporalScope";
import type { HolidayType } from "./HolidayType";
import {
  HolidayTypeFromJSON,
  HolidayTypeFromJSONTyped,
  HolidayTypeToJSON,
  HolidayTypeToJSONTyped,
} from "./HolidayType";
import type { SubdivisionReference } from "./SubdivisionReference";
import {
  SubdivisionReferenceFromJSON,
  SubdivisionReferenceFromJSONTyped,
  SubdivisionReferenceToJSON,
  SubdivisionReferenceToJSONTyped,
} from "./SubdivisionReference";
import type { LocalizedText } from "./LocalizedText";
import {
  LocalizedTextFromJSON,
  LocalizedTextFromJSONTyped,
  LocalizedTextToJSON,
  LocalizedTextToJSONTyped,
} from "./LocalizedText";

/**
 * Representation of a holiday
 * @export
 * @interface HolidayResponse
 */
export interface HolidayResponse {
  /**
   * Additional localized comments
   * @type {Array<LocalizedText>}
   * @memberof HolidayResponse
   */
  comment?: Array<LocalizedText> | null;
  /**
   * End date of the holiday
   * @type {Date}
   * @memberof HolidayResponse
   */
  endDate: Date;
  /**
   * Unqiue holiday id
   * @type {string}
   * @memberof HolidayResponse
   */
  id: string;
  /**
   * Localized names of the holiday
   * @type {Array<LocalizedText>}
   * @memberof HolidayResponse
   */
  name: Array<LocalizedText>;
  /**
   * Is the holiday nationwide?
   * @type {boolean}
   * @memberof HolidayResponse
   */
  nationwide: boolean;
  /**
   *
   * @type {RegionalScope}
   * @memberof HolidayResponse
   */
  regionalScope?: RegionalScope;
  /**
   * Start date of the holiday
   * @type {Date}
   * @memberof HolidayResponse
   */
  startDate: Date;

  /**
   *
   * @type {TemporalScope}
   * @memberof HolidayResponse
   */
  temporalScope?: TemporalScope;
  /**
   *
   * @type {HolidayType}
   * @memberof HolidayResponse
   */
  type: HolidayType;
}

/**
 * Check if a given object implements the HolidayResponse interface.
 */
export function instanceOfHolidayResponse(
  value: object
): value is HolidayResponse {
  if (!("endDate" in value) || value["endDate"] === undefined) return false;
  if (!("id" in value) || value["id"] === undefined) return false;
  if (!("name" in value) || value["name"] === undefined) return false;
  if (!("nationwide" in value) || value["nationwide"] === undefined)
    return false;
  if (!("startDate" in value) || value["startDate"] === undefined) return false;
  if (!("subdivisions" in value) || value["subdivisions"] === undefined)
    return false;
  if (!("type" in value) || value["type"] === undefined) return false;
  return true;
}

export function HolidayResponseFromJSON(json: any): HolidayResponse {
  return HolidayResponseFromJSONTyped(json, false);
}

export function HolidayResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): HolidayResponse {
  if (json == null) {
    return json;
  }
  return {
    comment:
      json["comment"] == null
        ? undefined
        : (json["comment"] as Array<any>).map(LocalizedTextFromJSON),
    endDate: new Date(json["endDate"]),
    id: json["id"],
    name: (json["name"] as Array<any>).map(LocalizedTextFromJSON),
    nationwide: json["nationwide"],
    regionalScope:
      json["regionalScope"] == null
        ? undefined
        : RegionalScopeFromJSON(json["regionalScope"]),
    startDate: new Date(json["startDate"]),
    temporalScope:
      json["temporalScope"] == null
        ? undefined
        : TemporalScopeFromJSON(json["temporalScope"]),
    type: HolidayTypeFromJSON(json["type"]),
  };
}

export function HolidayResponseToJSON(json: any): HolidayResponse {
  return HolidayResponseToJSONTyped(json, false);
}

export function HolidayResponseToJSONTyped(
  value?: HolidayResponse | null,
  ignoreDiscriminator: boolean = false
): any {
  if (value == null) {
    return value;
  }

  return {
    comment:
      value["comment"] == null
        ? undefined
        : (value["comment"] as Array<any>).map(LocalizedTextToJSON),
    endDate: value["endDate"].toISOString().substring(0, 10),
    id: value["id"],
    name: (value["name"] as Array<any>).map(LocalizedTextToJSON),
    nationwide: value["nationwide"],
    regionalScope: RegionalScopeToJSON(value["regionalScope"]),
    startDate: value["startDate"].toISOString().substring(0, 10),
    temporalScope: TemporalScopeToJSON(value["temporalScope"]),
    type: HolidayTypeToJSON(value["type"]),
  };
}
