

// A holder of values
class Card {
    // uniq
    id: number = 0;
    // Array of values in this bucket
    values: any[] = [];
    // card has multiple values
    multipleValues: boolean = false;
    // card has values that has no color
    noColorDefined: boolean = false;
    //
    y: string = "";
    //
    x: number = 0;
    //
    minValue: number = 0;
    maxValue: number = 0;
    value: number = 0;
  
    constructor() {

    }
  }
  
class CardsStorage {
    cards: Card[] = [];
    xBucketSize: number = 0;
    yBucketSize: number = 0;
    maxValue: number;
    minValue: number;
    multipleValues: boolean = false;
    noColorDefined: boolean = false;
    targets: string[] = [];
    targetIndex: any;

    constructor() {
        this.maxValue = 0;
        this.minValue = 0;

    }
  }

export {CardsStorage, Card};