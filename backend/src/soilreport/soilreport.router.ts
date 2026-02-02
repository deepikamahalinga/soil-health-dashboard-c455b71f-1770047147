export interface SoilReport {
  id: string;
  state: string;
  pH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface CreateSoilReportDTO {
  state: string;
  pH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface UpdateSoilReportDTO extends Partial<CreateSoilReportDTO> {}