import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import "./Banner.css"

export default function Banner() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <div className='banner'>
            <h1>Le blog de Bastien</h1>
            <p>Le blog d'un type lambda, mais pas AWS <span className='minor-text'>(Lambda, AWS Lambda, vous l'avez... 🤡)</span></p>
        </div>
    )
}