import { Enforcer } from "casbin";
import { Request, Response } from 'express';
import { Container } from "typedi";
import { getRepository } from 'typeorm';
import { logger } from '../../lib/logger';
import { GanttService } from "./gantt.service";
import { Gantt, GanttShare } from "./gantt.entity";
const uuidv1 = require('uuid/v1');
const hummus = require('hummus');
const memoryStreams = require('memory-streams');
const mergeImg = require('merge-img');
import { Queue } from '../../lib/queue.js';
import { Project } from "../project/project.entity";
import { EXPORT_PDF_SAVE_SERVER_TEMPORARY_TIME, EXPORT_PDF_ENDPOINT } from '../../lib/config';
import { parse } from 'node-html-parser';
import { decryptToken } from "../../lib/jwt";
import { fromGlobalId } from "graphql-relay";

export class GanttController {
  static files: any = {};
  static config: any = {};
  static tabs: any;
  static chromiumArgs: any;
  static chromiumExecutablePath: any;
  static quick: any;
  static testing: any;

  static taskQueue: any = new Queue({
    maxWorkers: GanttController.config['max-workers'],
    useTabs: Boolean(GanttController.tabs),
    chromiumExecutablePath: GanttController.chromiumArgs,
    chromiumArgs: GanttController.chromiumExecutablePath,
    quick: GanttController.quick,
    testing: GanttController.testing
  });

  static async ganttChartLoad(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {

      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }

      const projectId: any = request.query.project;
      const dataJSON: any | undefined = request.body;
      //const dataJSON = JSON.parse(data);
      const requestId: string = dataJSON.requestId;
      if (!projectId) throw new Error('Project ID required');
      let gantt: Gantt | undefined;
      gantt = await getRepository(Gantt).findOne({ projectId: projectId });
      if (!gantt) throw new Error('Gantt not exists');

      const ganttService: GanttService = Container.get(GanttService);

      const returnData: { [key: string]: any } = await ganttService.loadData(gantt, requestId);

      await response
        .status(200)
        .send(returnData)
        .end();
      return true;

    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, '');
    }
  }

  static async ganttChartLoad2(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {

      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }

      const projectId: any = request.query.project;
      const dataJSON: any | undefined = request.body;
      //const dataJSON = JSON.parse(data);
      const requestId: string = dataJSON.requestId;
      if (!projectId) throw new Error('Project ID required');
      let gantt: Gantt | undefined;
      gantt = await getRepository(Gantt).findOne({ projectId: projectId });
      if (!gantt) throw new Error('Gantt not exists');

      const ganttService: GanttService = Container.get(GanttService);

      const returnData: { [key: string]: any } = await ganttService.loadData(gantt, requestId);

      await response
        .status(200)
        .send(returnData)
        .end();
      return true;

    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, '');
    }
  }

  static async ganttChartShareLoad(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {
      const code: any = request.query.code;
      if (!code) throw new Error('Code required');
      const dataJSON: any | undefined = request.body;
      const deCode: { [index: string]: any } = await decryptToken(code);
      if (!deCode.ganttId) throw new Error('Invalid Code');
      await getRepository(GanttShare).findOneOrFail({code: code, isDeleted: false });
      
      //const dataJSON = JSON.parse(data);
      const requestId: string = dataJSON.requestId;
      let gantt: Gantt | undefined;
      gantt = await getRepository(Gantt).findOne({ id: fromGlobalId(deCode.ganttId).id });
      if (!gantt) throw new Error('Gantt not exists');

      const ganttService: GanttService = Container.get(GanttService);

      const returnData: { [key: string]: any } = await ganttService.loadData(gantt, requestId);

      await response
        .status(200)
        .send(returnData)
        .end();
      return true;

    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, '');
    }
  }
  static async ganttChartSync(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {

      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }

      const fromSyncData = (data:any) => {
        let returnData:any = {
          success: true,
          requestId: data.requestId,
        }
        if (data.tasks) {
          let rpTasks:any = {};
          if (data.tasks.added) {
            rpTasks.rows = [];
            for (let row of data.tasks.added){
              rpTasks.rows.push({ $PhantomId:row.$PhantomId, id:row.$PhantomId });
            }
          }
          if (data.tasks.removed) {
            rpTasks.removed = [];
            for (let row of data.tasks.removed){
              rpTasks.removed.push({ id:row.id });
            }
          }
          returnData.tasks = rpTasks;
        }
        if (data.dependencies) {
          let rpDependencies:any = {};
          if (data.dependencies.added) {
            rpDependencies.rows = [];
            for (let row of data.dependencies.added){
              rpDependencies.rows.push({ $PhantomId:row.$PhantomId, id:row.$PhantomId });
            }
          }
          if (data.dependencies.removed) {
            rpDependencies.removed = [];
            for (let row of data.dependencies.removed){
              rpDependencies.removed.push({ id:row.id });
            }
          }
          returnData.dependencies = rpDependencies;
        }
        if (data.assignments) {
          let rpAssignments:any = {};
          if (data.assignments.added) {
            rpAssignments.rows = [];
            for (let row of data.assignments.added){
              rpAssignments.rows.push({ $PhantomId:row.$PhantomId, id:row.$PhantomId });
            }
          }
          if (data.assignments.removed) {
            rpAssignments.removed = [];
            for (let row of data.assignments.removed){
              rpAssignments.removed.push({ id:row.id });
            }
          }
          returnData.assignments = rpAssignments;
        }
        return returnData;
      }

      const projectId: any | undefined = request.query.project;
      const appUUID: any | undefined = request.query.appUUID;
      if (!projectId) throw new Error('Project ID required');
      if (!appUUID) throw new Error('App uuid required');
      let gantt: Gantt | undefined;
      gantt = await getRepository(Gantt).findOne({ projectId: projectId });
      if (!gantt) throw new Error('Gantt not exists');

      const dataJSON: any | undefined = request.body;
      //const dataJSON = JSON.parse(data);
      if (dataJSON.type !== 'sync') throw new Error('Wrong type');

      //return if sync from subscription
      if (dataJSON.fromSync) {
        await response
        .status(200)
        .send(await fromSyncData(dataJSON))
        .end();
        return true;
      }

      const ganttService: GanttService = Container.get(GanttService);

      const res = await ganttService.batchSave(dataJSON, gantt, appUUID, user);

      if (res) {
        await response
          .status(200)
          .send(res)
          .end();
        return true;
      }

      return await this.responseError(response, 500, '');
    } catch (error: any) {
      logger.error(error);
      return await response.status(200).send({ success: false });
    }
  }
  static async ganttChartSync2(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {

      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }

      const fromSyncData = (data:any) => {
        let returnData:any = {
          success: true,
          requestId: data.requestId,
        }
        if (data.tasks) {
          let rpTasks:any = {};
          if (data.tasks.added) {
            rpTasks.rows = [];
            for (let row of data.tasks.added){
              rpTasks.rows.push({ $PhantomId:row.$PhantomId, id:row.$PhantomId });
            }
          }
          if (data.tasks.removed) {
            rpTasks.removed = [];
            for (let row of data.tasks.removed){
              rpTasks.removed.push({ id:row.id });
            }
          }
          returnData.tasks = rpTasks;
        }
        if (data.dependencies) {
          let rpDependencies:any = {};
          if (data.dependencies.added) {
            rpDependencies.rows = [];
            for (let row of data.dependencies.added){
              rpDependencies.rows.push({ $PhantomId:row.$PhantomId, id:row.$PhantomId });
            }
          }
          if (data.dependencies.removed) {
            rpDependencies.removed = [];
            for (let row of data.dependencies.removed){
              rpDependencies.removed.push({ id:row.id });
            }
          }
          returnData.dependencies = rpDependencies;
        }
        if (data.assignments) {
          let rpAssignments:any = {};
          if (data.assignments.added) {
            rpAssignments.rows = [];
            for (let row of data.assignments.added){
              rpAssignments.rows.push({ $PhantomId:row.$PhantomId, id:row.$PhantomId });
            }
          }
          if (data.assignments.removed) {
            rpAssignments.removed = [];
            for (let row of data.assignments.removed){
              rpAssignments.removed.push({ id:row.id });
            }
          }
          returnData.assignments = rpAssignments;
        }
        return returnData;
      }

      const projectId: any | undefined = request.query.project;
      const appUUID: any | undefined = request.query.appUUID;
      if (!projectId) throw new Error('Project ID required');
      if (!appUUID) throw new Error('App uuid required');
      let gantt: Gantt | undefined;
      gantt = await getRepository(Gantt).findOne({ projectId: projectId });
      if (!gantt) throw new Error('Gantt not exists');

      const dataJSON: any | undefined = request.body;
      //const dataJSON = JSON.parse(data);
      if (dataJSON.type !== 'sync') throw new Error('Wrong type');

      //return if sync from subscription
      if (dataJSON.fromSync) {
        await response
        .status(200)
        .send(await fromSyncData(dataJSON))
        .end();
        return true;
      }

      const ganttService: GanttService = Container.get(GanttService);

      const res = await ganttService.batchSave(dataJSON, gantt, appUUID, user);

      if (res) {
        await response
          .status(200)
          .send(res)
          .end();
        return true;
      }

      return await this.responseError(response, 500, '');
    } catch (error: any) {
      logger.error(error);
      return await response.status(200).send({ success: false });
    }
  }
  static async ganttChartInit(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {
      
      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }

      /*
      data = {
        projectId:number
        startDate!:string
        calendarId!:id
        hoursPerDay!:number
        daysPerWeek!:number
        daysPerMonth!:number
      }
      */
      const data: any | undefined = request.body.data;
      if (!data) throw new Error('data required');
      if (!data.projectId) throw new Error('Project ID required');
      const project = await getRepository(Project).findOne({ id: data.projectId });
      if (!project) throw new Error('Project not exists');
      if (project.ganttId) throw new Error('Project Gantt already exists');

      const ganttService: GanttService = Container.get(GanttService);

      const res = await ganttService.initGantt(data, project);

      if (res) {
        await response
          .status(200)
          .send(res)
          .end();
        return true;
      }

      return await this.responseError(response, 500, '');
    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, error.message);
    }
  }

  static async ganttChartMultiInit(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {

      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }

      /*
      data = [{
        projectId:number
        startDate!:string
        calendarId!:id
        hoursPerDay!:number
        daysPerWeek!:number
        daysPerMonth!:number
      },....]
      */
      const data: any | undefined = request.body.data;
      if (!data) throw new Error('data required');
      const ganttService: GanttService = Container.get(GanttService);

      const res = await ganttService.multiInitGantt(data);

      if (res) {
        await response
          .status(200)
          .send(res)
          .end();
        return true;
      }

      return await this.responseError(response, 500, '');
    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, error.message);
    }
  }

  static async ganttChartInsertTasks(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {
      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }
      /*
      project = 37,
      tasks = [
        {
          name: 'tasks 1',
          startDate: '2022-03-20',
          endDate: '2022-03-21',
          subTasks: [
            {
              name: 'subtasks 1',
              startDate: '2022-03-20',
              endDate: '2022-03-21',
            },
            {
              name: 'subtasks 2',
              startDate: '2022-03-20',
              endDate: '2022-03-21',
            }
          ]
        }
      ]...
      */
      const params: any | undefined = request.query;
      if (!params.project) throw new Error('project required');
      const project = await getRepository(Project).findOne({ id: params.project });
      if (!project) throw new Error('Project not exists');
      if (!project.ganttId) throw new Error('Project Gantt not exists');
      const gantt = await getRepository(Gantt).findOne({ id: project.ganttId });
      if (!gantt) throw new Error('Gantt not exists');

      if (!params.tasks) throw new Error('tasks required');
      const tasksJSON = JSON.parse(params.tasks);
      const ganttService: GanttService = Container.get(GanttService);

      const res = await ganttService.insertTasks(tasksJSON, gantt, user);

      if (res) {
        await response
          .status(200)
          .send(res)
          .end();
        return true;
      }

      return await this.responseError(response, 500, '');
    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, error.message);
    }
  }

  static async ganttChartInsertTasksPost(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    try {
      let user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 403, 'invalid user');
      }
      /*
      project = 37,
      tasks = [
        {
          name: 'tasks 1',
          startDate: '2022-03-20',
          endDate: '2022-03-21',
          subTasks: [
            {
              name: 'subtasks 1',
              startDate: '2022-03-20',
              endDate: '2022-03-21',
              duration: 1,
              assignments: [staff.id,staff.id]
            },
            {
              name: 'subtasks 2',
              startDate: '2022-03-20',
              endDate: '2022-03-21',
              duration: 1,
              assignments: [staff.id,staff.id]
            }
          ]
        }
      ]...
      */
      const params: any | undefined = request.body;
      if (!params.project) throw new Error('project required');
      const project = await getRepository(Project).findOne({ id: params.project });
      if (!project) throw new Error('Project not exists');
      if (!project.ganttId) throw new Error('Project Gantt not exists');
      const gantt = await getRepository(Gantt).findOne({ id: project.ganttId });
      if (!gantt) throw new Error('Gantt not exists');

      if (!params.tasks) throw new Error('tasks required');
      const tasksJSON = params.tasks;
      const ganttService: GanttService = Container.get(GanttService);

      const res = await ganttService.insertTasks(tasksJSON, gantt, user);

      if (res) {
        await response
          .status(200)
          .send(res)
          .end();
        return true;
      }

      return await this.responseError(response, 500, '');
    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, error.message);
    }
  }

  static async exportPDF(request: Request, response: Response, enforcer: Enforcer): Promise<any> {

    // let user = (request as any).user;
    // if (!user) {
    //   return await this.responseError(response, 403, '');
    // }

    const req = request.body;

    //Accepts encoded and parsed html fragments. If still encoded, then parse
    if (typeof req.html === 'string') {
      req.html = JSON.parse(req.html);
    }

    //fix export included useless css
    let regex = /\b(?:default.css|style)\b/gi;
    let regex2 = /\b(?:chunk.css)\b/gi;
    for (let i = 0; i < req.html.length; i++) {
      var root = parse(req.html[i].html);
      var head = root.getElementsByTagName('head');
      let delEle = true;
      for (let row of head[0].childNodes){
        if (row.toString().match(regex) && delEle){
          row.remove();
          delEle = true;
        }
        if (row.toString().match(regex2)){
          delEle = false;
        }
      }
      req.html[i].html = root.toString();
    }

    //Pass the request to the processFn
    this.exportRequestHandler(req, req.id).then(async (file: any) => {

      //On binary the buffer is directly sent to the client, else store file locally in memory for 10 seconds
      if (req.sendAsBinary) {
        response.set('Content-Type', 'application/octet-stream');
        response.status(200).send(file);
      }
      else {
        await response
          .status(200)
          .send({
            success: true,
            url: await this.setFile(EXPORT_PDF_ENDPOINT + request.originalUrl, req, file)
          })
          .end();
      }
    }).catch((e: { message: any; stack: any; }) => {
      //Make up min 500 or 200?
      response.status(req.sendAsBinary ? 500 : 200).jsonp({
        success: false,
        msg: e.message,
        stack: e.stack
      });
    });
  }

  /**
     * Stores a file stream temporarily to be fetched on guid
     *
     * @param host This host to fetch from
     * @param request Passed initial request
     * @param file The file buffer pdf/png
     * @returns {*}
     */
  static async setFile(host: string, request: any, file: any) {
    const
      me = this,
      fileKey = uuidv1(),
      url = host + fileKey;

    const encodedFilename = request.fileName ? encodeURIComponent(request.fileName): undefined;

    me.files[fileKey] = {
      date: new Date(),
      fileFormat: request.fileFormat,
      fileName: `${encodedFilename || `export-${request.range}`}.${request.fileFormat}`,
      buffer: file
    };

    //You got ten seconds to fetch the file
    setTimeout(() => {
      delete me.files[fileKey];
    }, parseInt(EXPORT_PDF_SAVE_SERVER_TEMPORARY_TIME));

    return url;
  }

  //Get the file, fileKey will be a guid. This serves the pdf
  static async getPDF(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
    const
      me = this,
      fileKey = request.params.fileKey,
      file = me.files[fileKey];
      const encodedFilename = encodeURIComponent(file.fileName);

    if (file) {
      response.set('Content-Type', 'application/' + file.fileFormat);

      // Use "inline" to be able to preview PDF file in a browser tab
      // res.set('Content-Disposition', 'inline; filename="' + file.fileName + '"');
      response.set('Content-Disposition', 'form-data; filename="' + file.fileName + '"');

      response.set('Access-Control-Expose-Headers', 'Content-Length');
      response.set('Content-Length', file.buffer.length);
      response.status(200).send(file.buffer);
      delete me.files[fileKey];
      return true;
    }
    else {
      response.send('File not found');
      return false;
    }
  }

  static async responseError(response: Response, httpStatusCode: number, errorMessage: string): Promise<boolean> {
    if (!errorMessage) {
      response.status(httpStatusCode).end();
    } else {
      response.status(httpStatusCode).send(errorMessage);
    }
    return false;
  }
  
  /**
     * Concatenate an array of PDF buffers and return the combined result. This function uses the hummus package, a
     * copy the hummus binary is delivered next to the executable.
     *
     * @param {Buffer[]} pdfs
     * @returns {Promise<Buffer>}
     */
  static async combinePdfBuffers(pdfs: any) {
    const outStream = new memoryStreams.WritableStream();
    try {
      if (pdfs.length === 1) {
        return pdfs[0];
      }

      const
        first = pdfs.shift(),
        firstPage = new hummus.PDFRStreamForBuffer(first),
        pdfWriter = hummus.createWriterToModify(firstPage, new hummus.PDFStreamForResponse(outStream));

      let next = pdfs.shift();

      while (next) {
        const nextPage = new hummus.PDFRStreamForBuffer(next);
        pdfWriter.appendPDFPagesFromPDF(nextPage);
        next = pdfs.shift();
      }

      pdfWriter.end();
      const mergedBuffer = outStream.toBuffer();
      outStream.end();

      return mergedBuffer;
    }
    catch (err) {
      outStream.end();
      throw err;
    }
  }

  /**
 * Concatenate an array of Png buffers and return the combined result.
 *
 * @param pngs
 * @returns {Promise<Buffer>}
 */
  static async combinePngBuffers(pngs: any) {
    return new Promise((resolve, reject) => {
      mergeImg(pngs, { direction: true }).then((img: { getBuffer: (arg0: string, arg1: (s: any, buf: any) => void) => void; }) => {
        img.getBuffer('image/png', (s: any, buf: unknown) => {
          resolve(buf);
        });
      }).catch((err: any) => {
        reject(err)
      });
    });
  }

  /**
  * Main entry to process an export request. The format of the request object should be:
  *
  * request
  *  - format: like A4
  *  - fileFormat: pdf | png
  *  - html: an array of html fragments (Strings).
  *      - html (this contains the fragment)
  *      - column
  *      - row
  *      - rowsHeight
  *      - number
  *  - range: like 'complete'
  *  - orientation : landscape | portrait
  *
  * @param request
  * @param requestId UUID of the request
  * @returns {Promise<Buffer>}
  */
  static async exportRequestHandler(request: any, requestId: any) {
    const
      { html, orientation, format, fileFormat, clientURL, width, height, pageRanges } = request,
      landscape = orientation === 'landscape';

    if (!html) {
      throw new Error('No html fragments found');
    }
    else {
      const
        config = {
          clientURL,
          fileFormat,
          width,
          height,
          pageRanges,
          format,
          landscape
        },
        dimension = format.split('*');

      //format can be send in format 12in*14in. This has precedence over A4, Letter et cetera
      if (dimension.length === 2) {
        config.width = dimension[0];
        config.height = dimension[1];
        config.pageRanges = '1-1';
      }
      else {
        config.format = format;
        config.landscape = landscape;
      }

      const files = await this.taskQueue.queue({ requestId, items: html.map((i: { html: any; }) => i.html), config });

      //All buffers are stored in the files object, we need to concatenate them
      if (files.length) {
        let result;

        switch (fileFormat) {
          case 'pdf':
            result = await this.combinePdfBuffers(files);
            break;
          case 'png':
            result = await this.combinePngBuffers(files);
            break;
        }
        return result;
      }
      else {
        throw new Error('Something went wrong: no files');
      }
    }
  }

  /**
     * Concatenate an array of PDF buffers and return the combined result. This function uses the hummus package, a
     * copy the hummus binary is delivered next to the executable.
     *
     * @param {Buffer[]} pdfs
     * @returns {Promise<Buffer>}
     */
  async combinePdfBuffers(pdfs: any[]) {
    const outStream = new memoryStreams.WritableStream();

    try {
      if (pdfs.length === 1) {
        return pdfs[0];
      }

      const
        first = pdfs.shift(),
        firstPage = new hummus.PDFRStreamForBuffer(first),
        pdfWriter = hummus.createWriterToModify(firstPage, new hummus.PDFStreamForResponse(outStream));

      let next = pdfs.shift();

      while (next) {
        const nextPage = new hummus.PDFRStreamForBuffer(next);
        pdfWriter.appendPDFPagesFromPDF(nextPage);
        next = pdfs.shift();
      }

      pdfWriter.end();
      const mergedBuffer = outStream.toBuffer();
      outStream.end();

      return mergedBuffer;
    }
    catch (err) {
      outStream.end();
      throw err;
    }
  }

}
