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
        env.estado = true
        const popup = env.estado ? '<p style="color:red">Ocupado <p>Orden: '+env.idOrden+'</p></p>' : '<p style="color:green">Disponible</p>' 
        const { lng, lat} = env.lngLat || env
        var el = document.createElement('div');
        el.className = 'marker';
     //   el.title = 'Entregando pedido a direccion: 5ta calle lote 9. Estado: Recogido en tienda'
        el.style.textAlign = 'center'
        el.innerHTML = '<h5 class="titulo">'+ env.nombre +'</h5>'
        const marker = new mapboxgl.Marker(el)

        marker.id = id ?? v4()
        marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(false)
        marker.setPopup(new mapboxgl.Popup({closeOnMove:false, closeOnClick:false, offset: 25 }) // add popups
        .setHTML('<h3>Repartidor cod:'+env.id+'</h3><p>'+popup+'</p>'))
        marcadores.current[ marker.id ] = marker

        if( !id ){
            nuevoMarcador.current.next({
                id: marker.id,
                lng, lat
            })
        }
        
        //escuchar movimientos marcador
       /* marker.on('drag', ({target}) =>{
            const { id } = target
            const { lng, lat } = target.getLngLat()
            movimientoMarcador.current.next({ id, lng, lat })
            marcadores.current[id].setPopup(new mapboxgl.Popup({closeOnMove:false, closeOnClick:false, offset: 25 }).setHTML('<h3>Repartidor 8</h3><p>Estado actual <p style="color:red">ocupado</p></p>'))
          
            movimientoMarcador.current.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>Repartidor 8</h3><p>Estado actual <p style="color:red">ocupado</p></p>'))
        })*/ 
    }, [])

    //ACTUALIZAR UBICACION MARCADOR
    const actualizarPosicion = useCallback(({id, lng, lat}) => {
        marcadores.current[id].setLngLat([lng, lat])
        marcadores.current[id].setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>Repartidor 8</h3><p>Estado actual <p style="color:red">ocupado</p></p>'))
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