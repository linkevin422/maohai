'use client';

import { MapContainer, MapContainerProps } from 'react-leaflet';
import { useRef } from 'react';

/**
 * This gives each MapContainer its own unique DOM node every mount.
 */
export default function SafeMapContainer(props: MapContainerProps) {
  const keyRef = useRef(Math.random().toString(36).slice(2));
  return <MapContainer key={keyRef.current} {...props} />;
}
