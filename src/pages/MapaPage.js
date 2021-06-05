import React, {useEffect, useContext} from 'react'
import logo from '../logo.png'
import { useMapbox } from '../hooks/useMapbox'
import { SocketContext } from '../context/SocketContext'

const puntoInicial = {
    lng: -90.4998236, 
    lat: 14.6078136, 
    zoom: 13.5
}
export const MapaPage = () => {

    const { setRef, coords, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial)
    const { socket } = useContext( SocketContext )

    useEffect(() => {
        socket.on('marcadores-activos', (marcadores) => {
            for( const key of Object.keys( marcadores )){
                agregarMarcador(marcadores[key], key)
            }
        })
    }, [socket, agregarMarcador])

    useEffect(() =>{
        nuevoMarcador$.subscribe(marcador => {
            socket.emit('marcador-nuevo', marcador)
        })
    }, [nuevoMarcador$, socket])

    useEffect(() =>{
        movimientoMarcador$.subscribe(marcador => {
            socket.emit('marcador-actualizado', marcador)
        })
    }, [movimientoMarcador$])

    useEffect(() => {
        socket.on('marcador-actualizado', (marcador) => {
            actualizarPosicion(marcador)
        })
    }, [socket, actualizarPosicion])

    //ESCUCHAR MARCADOREs NUEVOS
    useEffect(() => {
        socket.on('marcador-nuevo', (marcador) => {
            agregarMarcador(marcador, marcador.id)
        })
    }, [socket, agregarMarcador])
    
    return(
        <>
            <div className='info'>
                lng: {coords.lng} | lat: {coords.lat} | zoom {coords.zoom}
            </div>
            <div className='logo'>
                <img src={logo} alt="logo" width='100px' height='70px'/>
            </div>
            <div ref={ setRef } className='mapContainer'/>
        </>
    )
}