export interface GrcVariable {
    name: string;
    value: string | null;
}
export interface GrcVariableList {
    variables: GrcVariable[];
}
export declare enum GrcPrintVariableFormat {
    Source = "SOURCE",
    Constant = "CONSTANT"
}
export declare enum GrcPrintFormat {
    Env = "ENV",
    Json = "JSON"
}
export declare function getValue(configName: string, variableName: string, projectId?: string): Promise<GrcVariable>;
export declare function setValue(configName: string, variableName: string, value: string, projectId?: string): Promise<GrcVariable>;
export declare function unsetValue(configName: string, variableName: string, projectId?: string): Promise<string>;
export declare function listValues(configName: string, projectId?: string): Promise<GrcVariableList>;
export declare function printVariableList(variableList: GrcVariableList, printFormat?: GrcPrintFormat, variableNameFormat?: GrcPrintVariableFormat): string;
