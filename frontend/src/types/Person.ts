export type PersonCategory = "actor" | "director" | "writer";
export type EntityCategory = "company" | "country";
export type CreditCategory = PersonCategory | EntityCategory;

export type Person = {
  id: string;
  name: string;
  category: PersonCategory;
};

export type Entity = {
  id: string;
  name: string;
  category: EntityCategory;
};

export type CreditItem = {
  id: string;
  name: string;
  category: CreditCategory;
};
