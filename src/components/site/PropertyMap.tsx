"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { LocalizedProperty } from "@/server/domain/catalog/localize";
import { formatUSD } from "@/lib/format";
import { useI18n } from "./i18n-provider";

const pinIcon = L.divIcon({
  className: "",
  html: `
    <span style="
      display:flex; align-items:center; justify-content:center;
      width:34px; height:34px; border-radius:9999px;
      background:#E8503A; border:2px solid #FFFFFF;
      box-shadow:0 6px 16px 0 rgb(32 29 25 / 0.25);
      color:#FFFFFF; font-weight:700; font-size:15px; font-family:ui-monospace,monospace;
    ">∿</span>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

export function PropertyMap({ properties }: { properties: LocalizedProperty[] }) {
  const { locale, dict } = useI18n();
  const t = dict.map;
  const withCoords = properties.filter((p) => p.lat != null && p.lng != null);

  const center: [number, number] = [9.9085, -84.728];

  if (withCoords.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-mute">
        {t.noCoords}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line shadow-soft">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="z-0 h-[60vh] w-full sm:h-[70vh]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((property) => (
          <Marker
            key={property.id}
            position={[Number(property.lat), Number(property.lng)]}
            icon={pinIcon}
          >
            <Popup>
              <div className="min-w-44 font-sans">
                <p className="text-sm font-bold leading-tight text-ink">{property.name}</p>
                <p className="mt-1 text-xs text-mute">{property.location_label}</p>
                <p className="mt-2 text-sm font-bold text-ink">
                  {formatUSD(property.price_per_night)}
                  <span className="font-normal text-mute"> {t.perNight}</span>
                </p>
                <Link
                  href={`/${locale}/casas/${property.slug}`}
                  className="mt-2.5 inline-block rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {t.viewDetail}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* Lista accesible para quienes no pueden operar el mapa */}
      <ul className="sr-only">
        {withCoords.map((property) => (
          <li key={property.id}>
            <a href={`/${locale}/casas/${property.slug}`}>{property.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}