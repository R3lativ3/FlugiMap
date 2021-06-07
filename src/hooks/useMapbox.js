import { useRef, useState, useEffect, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { v4 } from 'uuid'
import { Subject } from 'rxjs'

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zZWJhciIsImEiOiJja3BobHdha28wZHNiMnVvbHliZmpwbHpsIn0.OIo30-2Nrs_k59ek_I8BIA';

export const useMapbox = ( puntoInicial ) => {

    const mapaDiv = useRef()
    const setRef = useCallback((node) => {
            mapaDiv.current = node
        },[])

    //listado
    const marcadores = useRef({})


    //observables Rxjs
    const movimientoMarcador = useRef( new Subject() )
    const nuevoMarcador = useRef( new Subject() )


    //mapa
    const mapa = useRef()
    const [coords, setCoords ] = useState(puntoInicial)


    //agregar marcadores
    const agregarMarcador = useCallback((env, id) => {

        const { lng, lat} = env.lngLat || env
        var el = document.createElement('div');
        el.className = 'marker';
        const marker = new mapboxgl.Marker(el)
        marker.id = id ?? v4()
        marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(false)

        marcadores.current[ marker.id ] = marker

        if( !id ){
            nuevoMarcador.current.next({
                id: marker.id,
                lng, lat
            })
        }
        /*
        //escuchar movimientos marcador
        marker.on('drag', ({target}) =>{
            const { id } = target
            const { lng, lat } = target.getLngLat()
            movimientoMarcador.current.next({ id, lng, lat })
        })*/
    }, [])

    //ACTUALIZAR UBICACION MARCADOR
    const actualizarPosicion = useCallback(({id, lng, lat}) => {
        marcadores.current[id].setLngLat([lng, lat])
    }, [])

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center:[puntoInicial.lng, puntoInicial.lat],
            zoom: puntoInicial.zoom
        })
        mapa.current = map
    }, [puntoInicial])

    //al mover mapa
    
    useEffect(() => {
        mapa.current?.on('move', () => {
            const { lng, lat} = mapa.current.getCenter()
            setCoords({
                lng:lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
        })

        return mapa.current?.off('move')
    }, [])
/*
    useEffect(() => {
        mapa.current?.on('click', agregarMarcador)
    }, [agregarMarcador])
*/
    return {
        agregarMarcador,
        coords, 
        marcadores,
        actualizarPosicion,
        setRef,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current
    }
}