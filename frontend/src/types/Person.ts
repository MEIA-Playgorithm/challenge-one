export type CreditCategory = "star" | "director" | "writer" | "production_company" | "country_origin";

export type CreditItem = {
  id: string;
  name: string;
  category: CreditCategory;
};
