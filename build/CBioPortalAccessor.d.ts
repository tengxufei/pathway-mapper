import EditorActionsManager from "./EditorActionsManager";
export default class CBioPortalAccessor {
    static readonly CNA_GAIN = 2;
    static readonly GET_ALL_CANCER_STUDIES_URL = "http://www.cbioportal.org/webservice.do?cmd=getCancerStudies";
    static readonly GET_GENETIC_PROFILES_URL = "http://www.cbioportal.org/webservice.do?cmd=getGeneticProfiles&cancer_study_id=";
    static readonly GET_PROFILE_DATA_URL = "http://www.cbioportal.org/webservice.do?cmd=getProfileData";
    static readonly MRNA_EXP_STUDY_NAME = "_mrna_median_Zscores";
    static readonly CNA_EXP_STUDY_NAME = "_gistic";
    static readonly VALIDATE_GENES_URL = "http://www.cbioportal.org/api/genes/fetch?geneIdType=HUGO_GENE_SYMBOL&projection=ID";
    static readonly MUTATION_EXP_STUDY_NAME = "_mutations";
    static readonly CNA_DELETION = -2;
    static readonly Z_SCORE_UPPER_THRESHOLD = 2;
    static readonly Z_SCORE_LOWER_THRESHOLD = -2;
    static readonly MUTATION = "Mutation";
    static readonly GENE_EXPRESSION = "Gene Expression";
    static readonly CNA = "Copy Number Alteration";
    editor: EditorActionsManager;
    constructor(editor: EditorActionsManager);
    getDataTypes(): string[];
    fetchCancerStudies(callbackFunction: any): void;
    getSupportedGeneticProfiles(cancerStudy: any, callbackFunction: any): void;
    isSupportedCancerProfile(cancerProfileName: string): boolean;
    static getDataType(cancerProfileName: string): "" | "Gene Expression" | "Copy Number Alteration" | "Mutation";
    calcAlterationPercentages(paramLines: any, geneticProfileId: any, callbackFunction: any): void;
    getProfileData(params: any, callbackFunction: any): void;
    validateGenes(nodeSymbols: any): void;
}
