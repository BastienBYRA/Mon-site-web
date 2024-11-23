import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import "./Banner.css"

export default function Banner() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <div className='banner'>
            <h1>{siteConfig.title}</h1>
            <p>{siteConfig.tagline}</p>
            <p>Lambda, AWS Lambda, vous l'avez...</p>
        </div>
    )
}