/* ========================================
 *           Gym interface
 * ======================================== */

export interface Gym {
  id: number;
  name: string;
  address: string;
  city: string;
  logo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  main_image_url?: string | null; 
}
