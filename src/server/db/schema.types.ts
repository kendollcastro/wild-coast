// Tipos TypeScript generados a partir del esquema SQL de Supabase
// (ver supabase/migrations). Regenerar con `supabase gen types typescript`
// cuando el proyecto esté linkeado. Mantener sincronizado con el SQL.

export type ListingStatus = 'active' | 'inactive';
export type BookingType = 'tour' | 'property';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type CommissionStatus = 'pending' | 'paid';
export type AvailabilityKind = 'booking' | 'blocked' | 'owner';
export type ComboStatus = 'active' | 'inactive';

// ---- shared column shapes --------------------------------------------------

type Timestamped = {
  created_at: string;
};

// ---- owners ----------------------------------------------------------------

export type OwnersRow = Timestamped & {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  commission_percent: number;
};

// ---- properties ------------------------------------------------------------

export type PropertiesRow = Timestamped & {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  location_label: string;
  location_label_en: string | null;
  lat: number | null;
  lng: number | null;
  capacity: number;
  bedrooms: number | null;
  bathrooms: number | null;
  price_per_night: number;
  currency: string;
  owner_id: string;
  status: ListingStatus;
  featured: boolean;
  amenities: unknown[];
  amenities_en: unknown[];
  wildlife_seen: unknown[];
  services: unknown[];
  brand: string | null;
  updated_at: string;
};

export type PropertyPhotosRow = {
  id: string;
  property_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

// ---- tours -----------------------------------------------------------------

export type TourPricingOption = {
  duration: string;
  price: number;
  variation_id?: string | null;
};

export type ToursRow = Timestamped & {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  highlights_en: string[];
  highlights_es: string[];
  includes_en: string[];
  includes_es: string[];
  duration: string | null;
  duration_hours: number | null;
  price: number;
  original_price: number | null;
  currency: string;
  capacity: number;
  max_participants: number | null;
  provider: string;
  commission_percent: number;
  category: string | null;
  badge_text: string | null;
  badge_color: string | null;
  pricing_options: TourPricingOption[];
  featured: boolean;
  status: ListingStatus;
  updated_at: string;
};

export type TourPhotosRow = {
  id: string;
  tour_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

// ---- bookings --------------------------------------------------------------

export type BookingsRow = Timestamped & {
  id: string;
  booking_code: string;
  booking_type: BookingType;
  property_id: string | null;
  tour_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  party_size: number;
  check_in: string | null; // date
  check_out: string | null; // date
  tour_date: string | null; // date
  status: BookingStatus;
  total_amount: number;
  commission_amount: number;
  currency: string;
  notes: string | null;
  updated_at: string;
};

export type BookingRow = BookingsRow;

// ---- availability_blocks ---------------------------------------------------

type AvailabilityBlocksRow = Timestamped & {
  id: string;
  property_id: string | null;
  tour_id: string | null;
  start_date: string; // date
  end_date: string; // date
  reason: AvailabilityKind;
  booking_id: string | null;
  period?: unknown; // daterange (no expuesto al cliente)
};

// vista pública sin booking_id
type AvailabilityCalendarRow = Timestamped & {
  id: string;
  property_id: string | null;
  tour_id: string | null;
  start_date: string;
  end_date: string;
  reason: AvailabilityKind;
};

// ---- commissions -----------------------------------------------------------

type CommissionsRow = Timestamped & {
  id: string;
  booking_id: string;
  amount: number;
  status: CommissionStatus;
  paid_at: string | null;
  notes: string | null;
};

// ---- combos ----------------------------------------------------------------

export type CombosRow = Timestamped & {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  property_id: string;
  discount_pct: number;
  badge_text: string | null;
  badge_color: string | null;
  featured: boolean;
  status: ComboStatus;
  updated_at: string;
};

export type ComboToursRow = {
  id: string;
  combo_id: string;
  tour_id: string;
  sort_order: number;
};

export type ComboPhotosRow = {
  id: string;
  combo_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

// ---- admins ----------------------------------------------------------------

type AdminsRow = Timestamped & {
  user_id: string;
  email: string;
};

// ---- RPC -------------------------------------------------------------------

export type CreateBookingArgs = {
  p_booking_type: BookingType;
  p_property_id: string | null;
  p_tour_id: string | null;
  p_guest_name: string;
  p_guest_email: string;
  p_guest_phone: string | null;
  p_party_size: number;
  p_check_in: string | null; // yyyy-mm-dd
  p_check_out: string | null;
  p_tour_date: string | null;
  p_notes: string | null;
}

export type CreateBookingResult = BookingsRow;

// ---- fotos en contexto de catálogo (vista embebida sin FK) -----------------

export type PhotoView = {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

// ---- joined domain views (catálogo público) --------------------------------

export type TourWithPhotos = ToursRow & {
  photos: PhotoView[];
};

export type PropertyWithPhotos = PropertiesRow & {
  photos: PhotoView[];
  owner?: Pick<OwnersRow, 'id' | 'name'> | null;
};

export type ComboWithPhotos = CombosRow & {
  photos: PhotoView[];
  tours: TourWithPhotos[];
  property?: PropertyWithPhotos | null;
};

// ---- Supabase Database generic ---------------------------------------------

export interface Database {
  public: {
    Tables: {
      owners: {
        Row: OwnersRow;
        Insert: Partial<OwnersRow>;
        Update: Partial<OwnersRow>;
        Relationships: [];
      };
      properties: {
        Row: PropertiesRow;
        Insert: Partial<PropertiesRow>;
        Update: Partial<PropertiesRow>;
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["id"];
          },
        ];
      };
      property_photos: {
        Row: PropertyPhotosRow;
        Insert: Partial<PropertyPhotosRow>;
        Update: Partial<PropertyPhotosRow>;
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      tours: {
        Row: ToursRow;
        Insert: Partial<ToursRow>;
        Update: Partial<ToursRow>;
        Relationships: [];
      };
      tour_photos: {
        Row: TourPhotosRow;
        Insert: Partial<TourPhotosRow>;
        Update: Partial<TourPhotosRow>;
        Relationships: [
          {
            foreignKeyName: "tour_photos_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: BookingsRow;
        Insert: Partial<BookingsRow>;
        Update: Partial<BookingsRow>;
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
      availability_blocks: {
        Row: AvailabilityBlocksRow;
        Insert: Partial<AvailabilityBlocksRow>;
        Update: Partial<AvailabilityBlocksRow>;
        Relationships: [
          {
            foreignKeyName: "availability_blocks_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_blocks_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_blocks_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      availability_calendar: {
        Row: AvailabilityCalendarRow;
        Insert: Partial<AvailabilityCalendarRow>;
        Update: Partial<AvailabilityCalendarRow>;
        Relationships: [];
      };
      commissions: {
        Row: CommissionsRow;
        Insert: Partial<CommissionsRow>;
        Update: Partial<CommissionsRow>;
        Relationships: [
          {
            foreignKeyName: "commissions_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      admins: {
        Row: AdminsRow;
        Insert: Partial<AdminsRow>;
        Update: Partial<AdminsRow>;
        Relationships: [];
      };
      combos: {
        Row: CombosRow;
        Insert: Partial<CombosRow>;
        Update: Partial<CombosRow>;
        Relationships: [
          {
            foreignKeyName: "combos_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      combo_tours: {
        Row: ComboToursRow;
        Insert: Partial<ComboToursRow>;
        Update: Partial<ComboToursRow>;
        Relationships: [
          {
            foreignKeyName: "combo_tours_combo_id_fkey";
            columns: ["combo_id"];
            isOneToOne: false;
            referencedRelation: "combos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "combo_tours_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
      combo_photos: {
        Row: ComboPhotosRow;
        Insert: Partial<ComboPhotosRow>;
        Update: Partial<ComboPhotosRow>;
        Relationships: [
          {
            foreignKeyName: "combo_photos_combo_id_fkey";
            columns: ["combo_id"];
            isOneToOne: false;
            referencedRelation: "combos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking: {
        Args: CreateBookingArgs;
        Returns: BookingsRow;
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_owner_of: { Args: { pid: string }; Returns: boolean };
      ratelimit_check: { Args: { p_key: string; p_max: number; p_window_seconds: number }; Returns: boolean };
    };
    Enums: {
      listing_status: ListingStatus;
      booking_type: BookingType;
      booking_status: BookingStatus;
      commission_status: CommissionStatus;
      availability_kind: AvailabilityKind;
      combo_status: ComboStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}