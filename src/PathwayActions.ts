import autobind from 'autobind-decorator'
import { observable, computed } from 'mobx'
import EditorActionsManager from './EditorActionsManager'
import FileOperationsManager, { IPathwayInfo } from './FileOperationsManager'
import $ from 'jquery'
import { IProfileMetaData, IPathwayData } from './react-pathway-mapper'
import SaveLoadUtility from './SaveLoadUtility'
import ViewOperationsManager from './ViewOperationsManager'
import pathways from './pathways.json'

export default class PathwayActions {
  @observable
  selectedPathway: string
  fileManager: FileOperationsManager
  editor: EditorActionsManager
  undoRedoManager: any
  pathwayHandler: (pathwayName: string) => void
  includePathway: (pathwayData: IPathwayData) => void
  eh: any
  profiles: IProfileMetaData[]

  uploader: any
  merger: any
  isCBioPortal: boolean
  viewOperationsManager: ViewOperationsManager
  overlayUploader: any

  constructor(
    pathwayHandler: (pathwayName: string) => void,
    profiles: IProfileMetaData[],
    fileManager: FileOperationsManager,
    includePathway: (pathwayData: IPathwayData) => void,
    isCBioPortal: boolean
  ) {
    this.pathwayHandler = pathwayHandler
    this.profiles = profiles
    this.fileManager = fileManager
    this.includePathway = includePathway
    this.isCBioPortal = isCBioPortal
  }

  @autobind
  resizeToContent() {
    this.editor.resizeNodesToContent(this.editor.cy.nodes())
  }

  @autobind
  align(param: string) {
    this.viewOperationsManager.handleNodeAlignment(param)
  }

  @autobind
  onChangeFile(e: any, isMerge: boolean) {
    const file = e.target.files[0] as File
    console.log(file)
    this.processFile(file, isMerge)
  }

  uploadOverlay() {
    this.overlayUploader.click()
  }

  overlayFromText(file: File) {
    // Create a new FormData object.
    var formData = new FormData()
    formData.append('graphFile', file)
    var request = new XMLHttpRequest()
    request.onreadystatechange = () => {
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status === 200
      ) {
        console.log('request.responseText')
        console.log(request.responseText)
        const linesOfData = request.responseText.split('\n')
        if (linesOfData.length > 0) {
          const profileIdsFromFile = linesOfData[0].split('\t').slice(1)
          console.log(profileIdsFromFile)
          this.profiles.push(
            ...profileIdsFromFile.map(id => ({ profileId: id, enabled: true }))
          )
        } else {
          console.log('No valid data')
        }
        this.editor.addGenomicData(request.responseText)
      }
    }
    request.open('POST', '/loadGraph')
    request.send(formData)
  }

  @autobind
  upload() {
    this.uploader.click()
  }

  @autobind
  merge() {
    this.merger.click()
  }

  setOverlayUploader(inputRef: any) {
    this.overlayUploader = inputRef
  }

  @autobind
  setUploaders(inputRef: any, isMerge: boolean) {
    if (isMerge) this.merger = inputRef
    else this.uploader = inputRef
  }

  @computed
  get getPathwayInfo() {
    return this.fileManager.getPathwayInfo
  }

  @autobind
  setPathwayInfo(other: IPathwayInfo) {
    this.fileManager.setPathwayInfo(other)
  }

  @autobind
  undo() {
    this.undoRedoManager.undo()
  }

  @autobind
  redo() {
    this.undoRedoManager.redo()
  }

  @autobind
  export(isSIFNX: boolean) {
    this.fileManager.saveGraph(isSIFNX, this.editor)
  }

  @autobind
  resetUndoStack() {
    this.undoRedoManager.reset()
  }

  @autobind
  newPathway() {
    this.editor.removeAllElements()
    this.fileManager.setPathwayInfo({
      pathwayTitle: 'New Pathway',
      pathwayDetails: '',
      fileName: 'pathway.txt'
    })
    this.removeAllData()
    this.resetUndoStack()
    this.pathwayHandler('Dummy')
  }

  @autobind
  changePathway(pathwayName: string) {
    this.pathwayHandler(pathwayName)

    if (!this.isCBioPortal) {
      this.fileManager.setPathwayInfo({
        pathwayTitle: pathwayName,
        pathwayDetails: '',
        fileName: pathwayName + '.txt'
      })
      // At the beginning changePathway is called editor is not ready hence removeData shall not be called
      if (this.editor) {
        this.removeAllData()
      }
    }
  }

  @autobind
  highlightNeighbours() {
    this.editor.highlightNeighbors()
  }

  @autobind
  highlightSelected() {
    this.editor.highlightSelected()
  }

  @autobind
  validateGenes() {
    this.editor.validateGenes()
  }

  @autobind
  showAll() {
    this.editor.showAllNodes()
  }

  @autobind
  hideSelected() {
    this.editor.hideSelectedNodes()
  }

  @autobind
  deleteSelected() {
    const selectedEles = this.editor.cy.elements(':selected')
    this.editor.removeElement(selectedEles)
  }

  @autobind
  addEdge(edgeTypeIndex: number) {
    // @ts-ignore
    window.edgeAddingMode = edgeTypeIndex + 1
    // @ts-ignore
    this.eh.disableDrawMode()
    this.eh.enableDrawMode()
  }

  @autobind
  changeNodeName(oldName: string, newName: string) {
    const cyNode = this.editor.cy.$('[name="' + oldName + '"]')[0]
    console.log(this.editor.cy.$('[name="' + oldName + '"]'))
    this.editor.changeName(cyNode, newName)
  }

  @autobind
  addNode(nodeType) {
    const nodeData = {
      type: nodeType.toUpperCase(),
      name: 'New ' + nodeType,
      w: '150',
      h: '52'
    }
    const extent = this.editor.cy.extent()
    const posData = {
      x: (extent.x1 + extent.x2) / 2,
      y: (extent.y1 + extent.y2) / 2
    }

    this.editor.addNode(nodeData, posData)
    this.pathwayHandler('Additional Pathway')
  }

  @autobind
  searchGene(geneName: string) {
    const selector = "node[name @*= '" + geneName + "']"
    const nodesContainingSearchedGene = this.editor.cy.filter(selector)
    let nodesToSelect = this.editor.cy.collection()
    nodesContainingSearchedGene.forEach(function(ele, index) {
      if (
        !ele.hasClass('highlightedNode') &&
        !ele.hasClass('invalidGeneHighlight')
      )
        nodesToSelect = nodesToSelect.union(ele)
    })
    this.editor.highlightBySearch(nodesToSelect)
  }

  @autobind
  removeAllData() {
    this.editor.removeGenomicData()
    this.profiles.length = 0
  }

  @autobind
  removeAllHighlight() {
    this.editor.removeAllHighlight()
  }

  @autobind
  processFile(file: File, isMerge: boolean) {
    // Create a new FormData object.
    const formData = new FormData()
    formData.append('graphFile', file)
    const request = new XMLHttpRequest()
    request.onreadystatechange = () => {
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status === 200
      ) {
        const pathwayData: IPathwayData = SaveLoadUtility.parseGraph(
          request.responseText,
          false
        )

        if (isMerge) {
          console.log('It is a merge')
          this.editor.mergeGraph(pathwayData.nodes, pathwayData.edges)
          const graphJSON = this.editor.cy.json()

          //TODO change file name maybe, probabyly  not necessary ?
          // Pathway nodes and edges are now combination of both previous and new pathway.
          pathwayData.nodes = graphJSON.elements.nodes //this.editor.cy.nodes().map((node) => ({data: node.data()}));
          pathwayData.edges = graphJSON.elements.edges //this.editor.cy.edges().map((edge) => ({data: edge.data()}));
          pathwayData.title = 'Additional Pathway'
        } else {
          this.editor.loadFile(pathwayData.nodes, pathwayData.edges)
          this.fileManager.setPathwayInfo({
            pathwayTitle: pathwayData.title,
            pathwayDetails: pathwayData.description,
            fileName: pathwayData.title + '.txt'
          })
        }

        this.pathwayHandler(pathwayData.title)
        this.resetUndoStack()
      }
    }
    request.open('POST', '/loadGraph')
    request.send(formData)
  }

  @autobind
  saveAs(type: string) {
    if (type === 'SVG') {
      this.fileManager.saveAsSVG(this.editor)
    } else if (type === 'PNG') {
      this.fileManager.saveAsPNG(this.editor.cy)
    } else if (type === 'JPEG') {
      this.fileManager.saveAsJPEG(this.editor.cy)
    }
  }

  @autobind
  editorHandler(editor, eh, undoRedoManager, viewOperationsManager) {
    this.editor = editor
    this.eh = eh
    this.undoRedoManager = undoRedoManager
    this.viewOperationsManager = viewOperationsManager
  }

  @autobind
  loadSampleData() {
    const data =
      'gene\tlung\tovarian\tbreast\ty\n' +
      'PTEN\t-7\t-20\t10\t20\n' +
      'NF1\t-12\t-4\t30\t20\n' +
      'PIK3CA\t18\t40\t-50\t20\n' +
      'KRAS\t11\t-5\t0\t20\n' +
      'ZIYA\t0\t-2\t0\t20\n' +
      'AKT1\t3\t30\t-10\t20\n' +
      'AKT2\t6\t-3\t20\t20\n' +
      'AKT3\t6\t-3\t20\t20\n' +
      '\n'
    this.editor.addGenomicData(data)
    this.profiles.push(
      { profileId: 'lung', enabled: true },
      { profileId: 'ovarian', enabled: true },
      { profileId: 'breast', enabled: true }
    )
  }

  @autobind
  performLayout() {
    this.editor.performLayout()
  }
}
