import { useState } from 'react'

export default function PrivacyModal({ onClose }) {
  const [view, setView] = useState('simplificado')

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '85vh',
          borderRadius: '16px',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700', color: '#38bdf8' }}>
            🛡️ Aviso de Privacidad
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #334155' }}>
          <button
            onClick={() => setView('simplificado')}
            style={{
              flex: 1,
              padding: '12px',
              background: view === 'simplificado' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              color: view === 'simplificado' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderBottom: view === 'simplificado' ? '2px solid #38bdf8' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Aviso Simplificado
          </button>
          <button
            onClick={() => setView('integral')}
            style={{
              flex: 1,
              padding: '12px',
              background: view === 'integral' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              color: view === 'integral' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderBottom: view === 'integral' ? '2px solid #38bdf8' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Aviso Integral
          </button>
        </div>

        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '0.925rem',
            lineHeight: '1.6',
            flex: 1,
          }}
        >
          {view === 'simplificado' ? (
            <div>
              <h3 style={{ color: '#38bdf8', marginBottom: '16px' }}>
                Aviso de Privacidad Simplificado
              </h3>
              <p>
                El <strong>Grupo Musical "Musical Group"</strong>, con sede en Dolores Hidalgo Cuna
                de la Independencia Nacional, Guanajuato, es el responsable del tratamiento de los
                datos personales que nos proporcione.
              </p>
              <p>
                Los datos personales que recabamos serán utilizados para las siguientes finalidades
                principales:
              </p>
              <ul>
                <li>Gestión e integración de los miembros de la agrupación musical.</li>
                <li>
                  Administración, control y seguimiento del inventario y préstamo de instrumentos
                  musicales.
                </li>
                <li>Coordinación de ensayos, eventos y comunicación interna de la banda.</li>
              </ul>
              <p>
                Si desea conocer la información completa sobre qué datos solicitamos, las
                finalidades secundarias, el fundamento legal, las transferencias a terceros y cómo
                puede ejercer sus derechos ARCO, le invitamos a leer nuestro{' '}
                <strong>Aviso de Privacidad Integral</strong> seleccionando la pestaña
                correspondiente en la parte superior.
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ color: '#38bdf8', marginBottom: '16px', textAlign: 'center' }}>
                Aviso de Privacidad Integral
              </h3>
              <p>
                <strong>El Grupo Musical "Musical Group"</strong>, con sede en la Ciudad de Dolores
                Hidalgo Cuna de la Independencia Nacional, Guanajuato, es el responsable de
                tratamiento de los datos personales que nos proporcionen, los cuales serán
                protegidos conforme a lo dispuesto por la Ley de Protección de Datos Personales en
                Posesión de Sujetos Obligados para el Estado de Guanajuato, y demás normatividad que
                resulte aplicable.
              </p>

              <h4 style={{ color: 'white', marginTop: '16px', marginBottom: '8px' }}>
                Finalidad del Tratamiento.
              </h4>
              <p>
                Los datos personales que recabemos de usted, los utilizaremos para las siguientes
                actividades:
              </p>
              <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                <li>
                  Integración y gestión del padrón de integrantes activos e inactivos de la
                  agrupación musical.
                </li>
                <li>
                  Administración del sistema de inventario y control de equipo musical, audio e
                  iluminación.
                </li>
                <li>
                  Procesamiento, autorización y seguimiento de solicitudes de préstamo y devolución
                  de instrumentos.
                </li>
                <li>
                  Generación de historiales de responsabilidad y uso de activos de la agrupación.
                </li>
                <li>
                  Coordinación logística para ensayos, presentaciones en vivo, giras y eventos
                  especiales.
                </li>
                <li>
                  Comunicación de avisos importantes, convocatorias y reportes de condiciones del
                  equipo (notas descriptivas).
                </li>
                <li>
                  Uso de imagen y voz para difusión y promoción de actividades de la agrupación por
                  medios impresos o electrónicos (previo consentimiento).
                </li>
              </ol>

              <h4 style={{ color: 'white', marginTop: '16px', marginBottom: '8px' }}>
                Datos personales recabados
              </h4>
              <p>
                Para las finalidades antes señaladas se solicitan los siguientes datos personales:
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px', columnCount: 2 }}>
                <li>Nombre(s) y apellido(s) completos</li>
                <li>Correo electrónico</li>
                <li>Rol o función dentro de la banda</li>
                <li>Biografía o experiencia musical</li>
                <li>Historial de uso de equipo</li>
                <li>Notas descriptivas de responsabilidad sobre el equipo</li>
              </ul>

              <h4 style={{ color: 'white', marginTop: '16px', marginBottom: '8px' }}>
                Fundamento legal.
              </h4>
              <p>
                El fundamento para el tratamiento de datos personales se basa en la Ley de
                Protección de Datos Personales en Posesión de Sujetos Obligados para el Estado de
                Guanajuato, enfocado a la correcta administración de recursos internos.
              </p>

              <h4 style={{ color: 'white', marginTop: '16px', marginBottom: '8px' }}>
                Transferencia de datos personales
              </h4>
              <p>
                Se le informa que sus datos personales no serán transmitidos a terceros ajenos a la
                administración de la agrupación musical sin su previo consentimiento, salvo
                requerimiento de autoridades competentes debidamente fundamentado.
              </p>

              <h4 style={{ color: 'white', marginTop: '16px', marginBottom: '8px' }}>
                Derechos ARCO
              </h4>
              <p>
                Para el ejercicio de cualquiera de los derechos ARCO, usted podrá presentar
                solicitud por escrito ante la Unidad de Transparencia del Poder Ejecutivo, vía
                Plataforma Nacional de Transparencia disponible en
                http://www.plataformadetransparencia.org.mx/web/guest/inicio o por correo
                electrónico unidadtransparencia@guanajuato.gob.mx
              </p>

              <p>
                <strong>Datos de la Unidad de Transparencia.</strong>
                <br />
                Domicilio: Prolongación Avenida Norte, Calle: Fresnillo #1, Zona Centro, Guanajuato,
                Guanajuato, C.P. 37800.
                <br />
                Teléfono: (418) 1434850
                <br />
                Correo electrónico: unidadtransparencia@guanajuato.gob.mx
              </p>

              <h4 style={{ color: 'white', marginTop: '16px', marginBottom: '8px' }}>
                Cambios al aviso de privacidad
              </h4>
              <p>
                En caso de realizar alguna modificación al aviso de privacidad, se le hará de su
                conocimiento a través del panel principal del sistema de gestión Musical Group o vía
                correo electrónico.
              </p>

              <p style={{ textAlign: 'right', fontStyle: 'italic', marginTop: '16px' }}>
                Última actualización
                <br />
                04 de julio de 2026
              </p>
            </div>
          )}
        </div>
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#0f172a',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
